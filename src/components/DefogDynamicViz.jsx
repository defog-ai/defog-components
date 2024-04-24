import React, { useState, useContext, Fragment } from "react";
import {
  Button,
  message,
  Modal,
  Input,
  ConfigProvider,
  Collapse,
  Alert,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { isEmpty, sentenceCase } from "./common/utils";
import { styled } from "styled-components";
import ThumbsUp from "./svg/ThumbsUp";
import ThumbsDown from "./svg/ThumbsDown";
import { ThemeContext } from "../context/ThemeContext";
import { TableChart } from "./TableChart";
// import Search from "antd/lib/input/Search";
// import { BsPlusCircle } from "react-icons/bs";

const errorMessages = {
  noResponse: "There was no response from our servers. Please try again.",
};

const DefogDynamicViz = ({
  response,
  query,
  debugMode,
  apiKey,
  sqlOnly,
  demoMode,
  narrativeMode,
  questionId,
  level,
  guidedTeaching,
}) => {
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasReflected, setHasReflected] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState("");
  const [reflectionColDescriptions, setReflectionColDescriptions] = useState(
    [],
  );
  const [reflectionRefQueries, setReflectionRefQueries] = useState([]);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [glossary, setGlossary] = useState("");
  const [postReflectionLoading, setPostReflectionLoading] = useState(false);
  const { TextArea } = Input;

  const warningMessage = (
    <Alert
      message="The question asked is quite different from the kinds of questions we saw in training. We have generated what we think is the right SQL query to answer this question, but please take it with a grain of salt."
      type="warning"
      closable
      showIcon
    />
  );

  // if no response, return error
  if (!response || isEmpty(response)) {
    return (
      <ErrorMessageWrap>
        <div className="defog-viz-error">
          <span>{errorMessages.noResponse}</span>
        </div>
      </ErrorMessageWrap>
    );
  }

  const uploadFeedback = async (feedback, feedbackText = "") => {
    if (feedback === "Good") {
      await fetch(`https://api.defog.ai/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey,
          response: response,
          feedback: feedback,
        }),
      });

      message.info("Thank you for your feedback!");
    } else {
      // send feedback over to the server
      await fetch(`https://api.defog.ai/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey,
          response: response,
          feedback: feedback,
          text: feedbackText,
        }),
      });

      if (guidedTeaching) {
        // send the error to the reflect endpoint
        setReflectionLoading(true);
        message.info(
          "Preparing improved instruction sets for the model. This can take up to 30 seconds. Thank you for your patience.",
        );

        // first, get the metadata so that we can easily compare it against the reflection
        const metadataResp = await fetch(`https://api.defog.ai/get_metadata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: apiKey,
          }),
        });
        const { table_metadata, glossary } = await metadataResp.json();
        setGlossary(glossary);

        const reflectResp = await fetch(
          `https://api.defog.ai/reflect_on_error`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              api_key: apiKey,
              question: response.question,
              sql_generated: response.generatedSql,
              error: feedbackText,
            }),
          },
        );

        const {
          feedback,
          instruction_set,
          column_descriptions,
          reference_queries,
        } = await reflectResp.json();

        // table_metadata is currently an object in the form of {table_name: [{column_name: ..., description: ...}]}
        // we need to convert it to an array of objects in the form of {table_name: ..., column_name: ..., description: ...}
        const column_descriptions_array = [];
        for (const table_name in table_metadata) {
          const columns = table_metadata[table_name];
          columns.forEach((column) => {
            column_descriptions_array.push({
              table_name: table_name,
              column_name: column.column_name,
              data_type: column.data_type,
              original_description: column.column_description,
            });
          });
        }

        // add a new key to each item in column_descriptions called "original description". this is the column description from the metadata
        const updatedDescriptions = [];

        column_descriptions_array.forEach((item) => {
          const found = column_descriptions.find(
            (meta) =>
              meta.table_name === item.table_name &&
              meta.column_name === item.column_name,
          );
          if (found) {
            updatedDescriptions.push({
              ...item,
              updated_description: found.description,
            });
          }
        });

        setHasReflected(true);
        setReflectionFeedback(feedback);
        setGlossary(glossary + "\n\n(new instructions)\n\n" + instruction_set);
        setReflectionColDescriptions(updatedDescriptions);
        setReflectionRefQueries(reference_queries);
        setReflectionLoading(false);
      } else {
        setModalVisible(false);
      }
    }
  };

  const updateNewInstructions = async () => {
    setPostReflectionLoading(true);
    // update glossary
    await fetch(`https://api.defog.ai/update_glossary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        glossary: glossary,
      }),
    });

    // update golden queries
    await fetch(`https://api.defog.ai/update_golden_queries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        golden_queries: reflectionRefQueries,
        scrub: false,
      }),
    });

    // update column descriptions
    await fetch(`https://api.defog.ai/update_column_descriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        column_descriptions: reflectionColDescriptions,
      }),
    });

    setPostReflectionLoading(false);
    setModalVisible(false);
    message.info(
      "The model's instruction set has now been updated. Thank you for the feedback!",
    );
  };

  let results;

  if (sqlOnly === true) {
    results = (
      <>
        <SQLContainer theme={theme.config}>
          {response.generatedSql && (
            <>
              <p>The following query was generated:</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {response.generatedSql}
              </pre>
            </>
          )}
        </SQLContainer>

        <FeedbackWrap theme={theme.config}>
          <p>How did we do with is this query?</p>
          <button onClick={() => uploadFeedback("Good")}>
            <ThumbsUp />
          </button>
          <button onClick={() => setModalVisible(true)}>
            <ThumbsDown />
          </button>
        </FeedbackWrap>
      </>
    );
  } else if (narrativeMode === true) {
    // do something
    console.log(response); //can basically ignore the query, it's just response.question
    // response has the following fields that are relevant to us:
    // columns, data, analysis, question, visualization
    results = (
      <>
        <div dangerouslySetInnerHTML={{ __html: response.analysis }}></div>
        <div style={{ paddingLeft: "2em" }}>
          <TableChart
            response={response}
            query={query}
            vizType={response.visualization || "table"}
          />
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: response.followUpQuestions }}
          style={{ paddingTop: "1em" }}
        ></div>
      </>
    );
  } else {
    results = (
      <>
        <TableChart response={response} query={query} vizType={"table"} />
        {demoMode && (
          <Collapse
            accordion
            items={[
              {
                key: "1",
                label: "Show SQL",
                children: (
                  <SQLContainer theme={theme.config}>
                    {response.generatedSql && (
                      <>
                        <p>The following query was generated:</p>
                        <pre style={{ whiteSpace: "pre-wrap" }}>
                          {response.generatedSql}
                        </pre>
                      </>
                    )}
                  </SQLContainer>
                ),
              },
            ]}
          />
        )}
        {debugMode && (
          <>
            <SQLContainer theme={theme.config}>
              {response.generatedSql && (
                <>
                  <p>The following query was generated:</p>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {response.generatedSql}
                  </pre>
                </>
              )}

              {response.debugInfo && (
                <>
                  <hr />
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {response.debugInfo}
                  </pre>
                </>
              )}
            </SQLContainer>

            <FeedbackWrap theme={theme.config}>
              <p>How did we do with is this query?</p>
              <button onClick={() => uploadFeedback("Good")}>
                <ThumbsUp />
              </button>
              <button onClick={() => setModalVisible(true)}>
                <ThumbsDown />
              </button>
            </FeedbackWrap>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorBgElevated: theme.config.background2,
            colorText: theme.config.primaryText,
            colorBgMask: "rgba(0, 0, 0, 0.75)",
          },
        }}
      >
        <Modal
          title="To improve the model, could you please give more details about why this is a bad query?"
          open={modalVisible}
          footer={null}
          onCancel={() => setModalVisible(false)}
          centered
          closeIcon={
            <CloseOutlined style={{ color: theme.config.brandColor }} />
          }
          width={800}
        >
          <FeedbackModalWrap theme={theme.config}>
            <>
              <TextArea
                rows={4}
                className="feedback-text"
                placeholder="Optional"
              />
              {!hasReflected ? (
                <Button
                  loading={reflectionLoading}
                  disabled={reflectionLoading}
                  onClick={() => {
                    uploadFeedback(
                      "Bad",
                      Array.from(
                        document.querySelectorAll(".feedback-text"),
                      ).pop().value,
                    );
                  }}
                >
                  Submit
                </Button>
              ) : (
                <>
                  <p>{reflectionFeedback}</p>

                  <p>Instruction Set:</p>
                  <TextArea
                    rows={8}
                    value={glossary}
                    onChange={(e) => setGlossary(e.target.value)}
                    style={{
                      marginTop: "1em",
                      marginBottom: "1em",
                    }}
                  />
                  <p>Column Descriptions:</p>
                  <ul>
                    {reflectionColDescriptions.map((item, idx) => {
                      return (
                        <li key={idx}>
                          Table Name: {item.table_name}
                          <br />
                          Column Name: {item.column_name}
                          <br />
                          Original Description: {item.original_description}
                          <br />
                          Suggested Description:{" "}
                          <TextArea
                            rows={2}
                            value={item.updated_description}
                            onChange={(e) => {
                              const updatedDescriptions = [
                                ...reflectionColDescriptions,
                              ];
                              updatedDescriptions[idx].updated_description =
                                e.target.value;
                              setReflectionColDescriptions(updatedDescriptions);
                            }}
                            style={{
                              marginBottom: "1em",
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <p>Reference Queries:</p>
                  <ul>
                    {reflectionRefQueries.map((item, idx) => {
                      return (
                        <li key={idx}>
                          Question: {item.question}
                          <br />
                          SQL:{" "}
                          <TextArea
                            rows={8}
                            value={item.sql}
                            onChange={(e) => {
                              const updatedQueries = [...reflectionRefQueries];
                              updatedQueries[idx].sql = e.target.value;
                              setReflectionRefQueries(updatedQueries);
                            }}
                            style={{
                              marginBottom: "1em",
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>

                  <Button
                    onClick={() => {
                      updateNewInstructions();
                    }}
                    loading={postReflectionLoading}
                    disabled={postReflectionLoading}
                  >
                    Update Instructions
                  </Button>
                </>
              )}
            </>
          </FeedbackModalWrap>
        </Modal>
      </ConfigProvider>
      <AnswerWrap level={level} theme={theme}>
        {response.warnUsers ? warningMessage : null}
        <ResultsWrap theme={theme.config} level={level}>
          <Collapse
            defaultActiveKey={[questionId]}
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <>{isActive ? "Click to hide table" : "Click to show table"}</>
            )}
            ghost
            items={[
              {
                key: questionId,
                label: sentenceCase(response.question),
                children: results && results,
              },
            ]}
          />
          {/* <p>{response.question}</p>
          {results && results} */}
        </ResultsWrap>
      </AnswerWrap>
    </>
  );
};

export default React.memo(DefogDynamicViz);

const ResultsWrap = styled.div`
  position: relative;
  width: 100%;
  padding: 0.2em 0;

  .ant-tabs-nav {
    margin-bottom: 0;
  }
  .ant-tabs-tabpane {
    border-top: none;
  }
  .ant-tabs-nav {
    border: none !important;
  }
  .ant-tabs-content-holder {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    padding: 12px 0px;
    border-radius: 0px 0px 7px 7px;
    overflow: hidden;
  }
  .ant-collapse-expand-icon {
    margin-inline-start: 0 !important;
    padding-inline-start: 5px !important;
    opacity: 0;
    font-weight: normal;
    font-size: 0.8em;
    color: ${(props) => (props.theme ? props.theme.brandLight : "#0D0D0D")};
  }
  &:hover {
    .ant-collapse-expand-icon {
      opacity: 1;
    }
  }
  .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
    background: transparent;
    height: 2px;
  }

  .ant-tabs-top > .ant-tabs-nav::before {
    border-bottom: none;
  }
  .ant-tabs-tab {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    padding: 12px 8px;
    padding-right: 15px;
    border-radius: 7px 7px 0px 0px;
    opacity: 0.5;
    overflow: hidden;

    &:hover {
      opacity: 0.75;
    }
  }
  .ant-tabs-tab.ant-tabs-tab-active {
    opacity: 1;
  }
  .ant-tabs .ant-tabs-tab .ant-tabs-tab-btn {
    position: relative;
    z-index: 5;
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-tabs .ant-tabs-tab + .ant-tabs-tab {
    margin: 0 0 0 2px;
  }

  .chart-container-select h4 {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#F8FAFB")};
  }

  .ant-table-wrapper
    .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(
      .ant-table-row-expand-icon-cell
    ):not([colspan])::before,
  .ant-table-wrapper
    .ant-table-thead
    > tr
    > td:not(:last-child):not(.ant-table-selection-column):not(
      .ant-table-row-expand-icon-cell
    ):not([colspan])::before {
    background-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }

  .ant-table-wrapper .ant-table-thead > tr > th,
  .ant-table-wrapper .ant-table-thead > tr > td {
    border-bottom-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }

  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr
    > td {
    border-top-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
    border-bottom-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }
  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr:last-child
    > td {
    border-top-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
    border-bottom-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }
  .ant-pagination .ant-pagination-item a {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-pagination .ant-pagination-item-active {
    background: ${(props) => (props.theme ? props.theme.background1 : "#FFF")};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-pagination
    .ant-pagination-jump-prev
    .ant-pagination-item-container
    .ant-pagination-item-ellipsis,
  .ant-pagination
    .ant-pagination-jump-next
    .ant-pagination-item-container
    .ant-pagination-item-ellipsis {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }

  .ant-pagination-item-link span {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-pagination .ant-pagination-item-active {
    border-color: ${(props) =>
      props.theme ? props.theme.brandColor : "#2B59FF"};
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background-color: ${(props) =>
      props.theme ? props.theme.background1 : "#FFF"};
    border: 1px solid
      ${(props) => (props.theme ? props.theme.brandColor : "#FFF")};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};

    & + .ant-select-arrow {
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
    }
  }

  .exportNarativeBtn {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    gap: 2px;

    position: relative;
    margin-top: 12px;
    gap: 12px;

    button {
      background: ${(props) =>
        props.theme ? props.theme.background2 : "#F8FAFB"};
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
      border-radius: 7px 7px 0px 0px;
      min-height: 46px;
      border: none;
      box-shadow: none;

      @container (max-width: 650px) {
        border-radius: 7px;
        width: 100%;
      }
    }
  }

  .ant-collapse {
    .ant-collapse-header {
      padding: 0 !important;

      font-weight: bold;
      &[aria-expanded="true"] {
        margin-bottom: 0.4em;
      }
      background: transparent !important;
      .ant-collapse-header-text {
        flex: none !important;
        margin: 0;
        color: ${(props) => (props.theme ? props.theme.brandLight : "#F8FAFB")};
      }
    }

    .ant-collapse-content-box {
      background-color: #00000009;
      padding: 10px 10px !important;
      border-radius: 10px;
    }
  }
`;

const SQLContainer = styled.div`
  color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  & > p:nth-of-type(1) {
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 0px;
  }

  & > pre {
    margin-top: 6px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 4px;
    white-space: pre-line;
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.15);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #1677ffc4;
      border-radius: 2px;
    }
  }
`;

const FeedbackWrap = styled.div`
  background: ${(props) => (props.theme ? props.theme.background2 : "#F8FAFB")};
  color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  border-radius: 7px;
  display: inline-flex;
  padding: 12px;
  font-size: 14px;
  gap: 12px;
  margin-top: 20px;
  line-height: 1;

  @container (max-width: 650px) {
    padding: 12px;
    gap: 8px;
  }

  & > p {
    margin: 0;
    margin-right: 20px;
    @container (max-width: 650px) {
      font-size: 13px;
      margin-right: 12px;
    }
  }
  & > button {
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    svg {
      width: 12px;
      height: 12px;
      @container (max-width: 650px) {
        width: 12px;
        height: 12px;
      }
    }

    &:nth-of-type(2) {
      transform: translateY(4px);
    }

    &:hover {
      svg {
        path {
          fill: #444;
        }
      }
    }
  }
`;

const FeedbackModalWrap = styled.div`
  padding-top: 12px;

  .ant-input {
    background: ${(props) =>
      props.theme ? props.theme.background1 : "#F8FAFB"};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
    box-shadow: none;
    border-color: ${(props) =>
      props.theme ? props.theme.questionBorder : "#F8FAFB"};

    &:hover {
      border-color: ${(props) =>
        props.theme ? props.theme.brandColor : "#F8FAFB"};
    }
    &::placeholder {
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
      opacity: 0.7;
    }
  }

  button {
    margin-top: 12px;
    color: #fff;
    box-shadow: none;
    border: none;
    background: ${(props) =>
      props.theme ? props.theme.brandColor : "#2B59FF"};
    width: 100%;

    &:hover {
      color: #fff !important;
      opacity: 0.8;
    }
  }
`;

const ErrorMessageWrap = styled.div`
    .defog-viz-error {
      width: 100%;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      span {
        color: ${(props) =>
          props.theme ? props.theme.secondaryText : "#606060"};
      }
    }
  }
`;

const AnswerWrap = styled.div`
  margin-bottom: 12px;
  position: relative;
  transition: all 0.2s ease-in-out;
  margin: 0.2em 0;
  padding: 0.2em 0.4em;
  padding-left: 10px;
  // max-width: 40%;
  background: ${(props) => props.theme.config.background2};

  border-radius: 3px;
  border-left: ${({ theme }) => `4px solid ${theme.config.brandLight}`};
`;

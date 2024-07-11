import React, { useState, useContext, Fragment } from "react";
import { Modal, ConfigProvider, Collapse, Alert, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { isEmpty, sentenceCase } from "./common/utils";
import { styled } from "styled-components";
import ThumbsUp from "./svg/ThumbsUp";
import ThumbsDown from "./svg/ThumbsDown";
import { ThemeContext } from "../context/ThemeContext";
import { TableChart } from "./TableChart";
import Feedback from "./Feedback";
// import Search from "antd/lib/input/Search";
// import { BsPlusCircle } from "react-icons/bs";

const errorMessages = {
  noResponse: "There was no response from our servers. Please try again.",
};

const DefogDynamicViz = ({
  response,
  query,
  debugMode,
  sqlOnly,
  demoMode,
  narrativeMode,
  questionId,
  level,
  guidedTeaching,
  dev,
  baseDefogUrl,
  additionalParams,
}) => {
  const { theme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);

  const warningMessage = (
    <Alert
      message="The question asked is quite different from the kinds of questions we saw in training. We have generated what we think is the right SQL query to answer this question, but please take it with a grain of salt."
      type="warning"
      closable
      showIcon
    />
  );

  const uploadPositiveFeedback = async () => {
    await fetch(`${baseDefogUrl}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response: response,
        feedback: feedbackType,
        dev: dev,
        ...additionalParams,
      }),
    });

    message.info("Thank you for your feedback!");
  };

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
          <button
            onClick={() => {
              setFeedbackType("Good");
              uploadPositiveFeedback();
            }}
          >
            <ThumbsUp />
          </button>
          <button
            onClick={() => {
              setFeedbackType("Bad");
              setModalVisible(true);
            }}
          >
            <ThumbsDown />
          </button>
        </FeedbackWrap>
      </>
    );
  } else if (narrativeMode === true) {
    // do something
    //can basically ignore the query, it's just response.question
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
            recommendedXAxisColumns={response.xAxisColumns}
            recommendedYAxisColumns={response.yAxisColumns}
          />
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: response.followUpQuestions }}
          style={{ paddingTop: "1em" }}
        ></div>
        {debugMode && (
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
      </>
    );
  } else {
    results = (
      <>
        <TableChart
          response={response}
          query={query}
          vizType={response.visualization || "table"}
          recommendedXAxisColumns={response.xAxisColumns}
          recommendedYAxisColumns={response.yAxisColumns}
        />
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
              <button
                onClick={() => {
                  setFeedbackType("Good");
                  uploadPositiveFeedback();
                }}
              >
                <ThumbsUp />
              </button>
              <button
                onClick={() => {
                  setFeedbackType("Bad");
                  setModalVisible(true);
                }}
              >
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
            <Feedback
              dev={dev}
              guidedTeaching={guidedTeaching}
              questionId={questionId}
              response={response}
              setModalVisible={setModalVisible}
              additionalParams={additionalParams}
              baseDefogUrl={baseDefogUrl}
            />
          </FeedbackModalWrap>
        </Modal>
      </ConfigProvider>
      <AnswerWrap
        level={level}
        theme={theme}
        style={{
          // should glow green if feedback is good, red if feedback is bad, and no glow if no feedback
          border:
            feedbackType === "Good"
              ? `2px solid #2ca25f`
              : feedbackType === "Bad"
              ? `2px solid #FF4D4F`
              : null,
          boxShadow:
            feedbackType === "Good"
              ? `0px 0px 10px 5px rgba(44, 162, 95, 0.5)`
              : feedbackType === "Bad"
              ? `0px 0px 10px 5px rgba(255, 77, 79, 0.5)`
              : null,
        }}
      >
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

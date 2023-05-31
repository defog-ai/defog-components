import React, { useState, useRef, Fragment, useEffect } from "react";
import Lottie from "lottie-react";
import { Input, Collapse, message } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import SearchState from "./components/SearchState.js";
import LoadingLottie from "./components/svg/loader.json";
import DefogDynamicViz from "./components/DefogDynamicViz.js";
import { inferColumnType } from "./components/common/utils.js";
import QALayout from "./components/common/QALayout.js";
import {
  ThemeContext,
  darkThemeColor,
  lightThemeColor,
} from "./context/ThemeContext.js";
import styled from "styled-components";
import ThemeSwitchButton from "./components/common/ThemeSwitchButton.js";

export const AskDefogChat = ({
  apiEndpoint,
  maxHeight = "100%",
  maxWidth = "100%",
  buttonText = "Ask Defog",
  debugMode = false,
  personality = "Friendly",
  apiKey,
  darkMode,
  additionalParams = {},
  // can be "websocket" or "http"
  mode = "http",
}) => {
  const { Search } = Input;
  const { Panel } = Collapse;
  const [isActive, setIsActive] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [chatResponseArray, setChatResponseArray] = useState([]);
  const [dataResponseArray, setDataResponseArray] = useState([]);
  const [vizType, setVizType] = useState("table");
  const [rawData, setRawData] = useState([]);
  const [query, setQuery] = useState("");
  const divRef = useRef(null);

  const [theme, setTheme] = useState({
    type: darkMode === true ? "dark" : "light",
    config: darkMode === true ? darkThemeColor : lightThemeColor,
  });

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    if (darkMode === null || darkMode === undefined) {
      if (systemTheme === "dark") {
        setTheme({ type: "dark", config: darkThemeColor });
      } else {
        setTheme({ type: "light", config: lightThemeColor });
      }
    } else if (darkMode === true) {
      setTheme({ type: "dark", config: darkThemeColor });
    } else if (darkMode === false) {
      setTheme({ type: "light", config: lightThemeColor });
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setTheme(
      theme.type === "light"
        ? { type: "dark", config: darkThemeColor }
        : { type: "light", config: lightThemeColor }
    );
  };

  // const generateChatPath = "generate_query_chat";
  // const generateDataPath = "generate_data";

  function makeURL(urlPath = "") {
    return apiEndpoint + urlPath;
  }

  var comms = useRef(null);

  if (mode === "websocket") {
    function setupWebsocket() {
      comms.current = new WebSocket(apiEndpoint);
    }

    // if it's not open or not created yet, recreate
    if (!comms.current || comms.current.readyState !== comms.current.OPEN) {
      setupWebsocket();
    }

    // re declare this everytime, otherwise the handlers have closure over state values and never get updated state.
    // we COULD use useCallback here but something for the future perhaps.
    comms.current.onmessage = function (event) {
      const response = JSON.parse(event.data);

      if (response.response_type === "model-completion") {
        handleChatResponse(response, query, false);
      } else if (response.response_type === "generated-data") {
        handleDataResponse(response, query);
      }
    };
  }

  const handleSubmit = async (query) => {
    if (!query.trim()) {
      message.error("Please enter a question to search");
      return;
    }
    setButtonLoading(true);
    setQuery(query);
    setTimeout(() => {
      const divEl = document.getElementById("results");
      divEl.scrollTo({
        top: divRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);

    if (mode === "websocket") {
      comms.current.send(
        JSON.stringify({
          question: query,
          previous_context: previousQuestions,
        })
      );
    } else if (mode === "http") {
      try {
        const queryChatResponse = await fetch(makeURL(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: query,
            previous_context: previousQuestions,
            ...additionalParams,
            personality: personality,
          }),
        }).then((d) => d.json());

        if (queryChatResponse.ran_successfully === false) {
          throw Error(
            `query didn't run successfully. Here's the response received: ${JSON.stringify(
              queryChatResponse
            )}`
          );
        }

        handleChatResponse(queryChatResponse, query);
      } catch (e) {
        console.log(e);
        message.error(
          "An error occurred on our server. Sorry about that! We have been notified and will fix it ASAP."
        );
        setButtonLoading(false);
      }
    }
  };

  function handleChatResponse(queryChatResponse, query, executeData = true) {
    // set response array to have the latest everything except data and columns
    setChatResponseArray([
      ...chatResponseArray,
      {
        queryReason: queryChatResponse.reason_for_query,
        suggestedQuestions: queryChatResponse.suggestion_for_further_questions,
        question: query,
        generatedSql:
          queryChatResponse.query_generated || queryChatResponse.code,
        previousContext: previousQuestions,
        results: queryChatResponse.results,
      },
    ]);

    const contextQuestions = [query, queryChatResponse.query_generated];
    setPreviousQuestions([...previousQuestions, ...contextQuestions]);
    if (executeData) {
      handleDataResponse(queryChatResponse, query);
    }
  }

  function handleDataResponse(dataResponse, query) {
    console.log(dataResponse);
    // remove rows for which every value is null
    setRawData(
      dataResponse?.data.filter((d) => !d.every((val) => val === null))
    );
    if (
      query.toLowerCase().indexOf("pie chart") > -1 ||
      query.toLowerCase().indexOf("piechart") > -1
    ) {
      setVizType("Pie Chart");
    } else if (
      query.toLowerCase().indexOf("bar chart") > -1 ||
      query.toLowerCase().indexOf("barchart") > -1 ||
      query.toLowerCase().indexOf("column chart") > -1 ||
      query.toLowerCase().indexOf("columnchart") > -1
    ) {
      setVizType("Bar Chart");
    } else if (
      query.toLowerCase().indexOf("trend chart") > -1 ||
      query.toLowerCase().indexOf("trendchart") > -1 ||
      query.toLowerCase().indexOf("line chart") > -1 ||
      query.toLowerCase().indexOf("linechart") > -1
    ) {
      setVizType("Line Chart");
    } else if (dataResponse.code) {
      setVizType("text");
    } else if (query.toLowerCase().indexOf(" chart ") > -1) {
      setVizType("Bar Chart");
    } else {
      setVizType("table");
    }

    let newCols;
    let newRows;

    // if inferred typeof column is number, decimal, or integer
    // but simple typeof value is string, means it's a numeric value coming in as string
    // so coerce them to a number
    // store the indexes of such columns
    const numericAsString = [];
    // deal with columns like "user_id" etc coming in as numbers.
    // if inferred type is numeric but variable Type is "categorical"
    const stringAsNumeric = [];

    // remove rows for which every value is null
    const validData = dataResponse?.data.filter(
      (d) => !d.every((val) => val === null)
    );

    if (dataResponse.columns && validData.length > 0) {
      const cols = dataResponse.columns;
      const rows = validData;
      newCols = [];
      newRows = [];
      for (let i = 0; i < cols.length; i++) {
        newCols.push(
          Object.assign(
            {
              title: cols[i],
              dataIndex: cols[i],
              key: cols[i],
              // simple typeof. if a number is coming in as string, this will be string.
              simpleTypeOf: typeof rows[0][i],
              sorter:
                rows.length > 0 && typeof rows[0][i] === "number"
                  ? (a, b) => a[cols[i]] - b[cols[i]]
                  : (a, b) =>
                      String(a[cols[i]]).localeCompare(String(b[cols[i]])),
            },
            inferColumnType(rows, i, cols[i])
          )
        );
        if (newCols[i].numeric && newCols[i].simpleTypeOf === "string") {
          numericAsString.push(i);
        }
        if (
          newCols[i].numeric &&
          newCols[i].simpleTypeOf === "number" &&
          newCols[i].variableType === "categorical"
        ) {
          stringAsNumeric.push(i);
        }
      }

      for (let i = 0; i < rows.length; i++) {
        let row = {};
        for (let j = 0; j < cols.length; j++) {
          if (numericAsString.indexOf(j) >= 0) {
            row[cols[j]] = +rows[i][j];
          } else if (stringAsNumeric.indexOf(j) >= 0) {
            row[cols[j]] = "" + rows[i][j];
          } else row[cols[j]] = rows[i][j];
        }
        rows["key"] = i;
        newRows.push(row);
      }
    } else {
      newCols = [];
      newRows = [];
    }

    console.log(newCols);

    // update the last item in response array with the above data and columns
    setDataResponseArray([
      ...dataResponseArray,
      {
        data: newRows,
        columns: newCols,
      },
    ]);

    setButtonLoading(false);

    // scroll to the bottom of the results div

    setTimeout(() => {
      const divEl = document.getElementById("answers");
      divEl.scrollTo({
        top: divEl.scrollHeight - 600,
        behavior: "auto",
      });
    }, 200);
  }
  const genExtra = () => (
    <ThemeSwitchButton mode={theme.type} handleMode={toggleTheme} />
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Wrap theme={theme.config}>
        <div
          ref={divRef}
          id="results"
          style={{
            overflow: "hidden",
            maxHeight: maxHeight,
          }}
        >
          {/* add a button on the top right of this div with an expand arrow */}
          <Collapse
            bordered={false}
            defaultActiveKey={["1"]}
            expandIconPosition="end"
            style={{
              color: theme.config.primaryText,
              backgroundColor: theme.config.background1,
              borderRadius: 0,
            }}
            expandIcon={() => (
              <CaretRightOutlined rotate={isActive ? 270 : 90} />
            )}
            onChange={(state) =>
              state.length > 1 ? setIsActive(true) : setIsActive(false)
            }
          >
            <Panel
              header={buttonText}
              key="1"
              style={{ color: theme.config.primaryText }}
              extra={genExtra()}
            >
              <div
                id="answers"
                style={{
                  width: "100%",
                  maxWidth: maxWidth,
                  maxHeight:
                    typeof maxHeight == "number"
                      ? `calc(${maxHeight}px - 120px)`
                      : `calc(${maxHeight} - 120px)`,
                  overflowY: "scroll",
                  overflowX: "scroll",
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
              >
                {chatResponseArray.map((response, index) => {
                  return (
                    <ColoredContainer key={index} theme={theme.config}>
                      <QALayout type={"Question"}>
                        <p style={{ margin: 0 }}>{response.question}</p>
                      </QALayout>
                      <QALayout type={"Answer"}>
                        <>
                          <p style={{ marginTop: 0 }}>{response.queryReason}</p>
                          {!dataResponseArray[index] ? (
                            <div
                              className="data-loading-search-state"
                              style={{ width: "50%", margin: "0 auto" }}
                            >
                              <SearchState
                                message={
                                  "Query generated! Getting your data..."
                                }
                                lottie={
                                  <Lottie
                                    animationData={LoadingLottie}
                                    loop={true}
                                  />
                                }
                              />
                            </div>
                          ) : (
                            <DefogDynamicViz
                              vizType={vizType}
                              response={Object.assign(
                                chatResponseArray[index],
                                dataResponseArray[index]
                              )}
                              rawData={rawData}
                              query={query}
                              debugMode={debugMode}
                              apiKey={apiKey}
                            />
                          )}
                          {/* {response.suggestedQuestions && (
                            <>
                              <h5
                                style={{
                                  margin: "12px 0 0 8px",
                                  color: theme.config.primaryText,
                                  opacity: 0.6,
                                }}
                              >
                                Suggested Question(s)
                              </h5>
                              <SuggestedQuestionWrap
                                theme={theme.config}
                                onClick={() =>
                                  handleSubmit(response.suggestedQuestions)
                                }
                              >
                                {response.suggestedQuestions}
                              </SuggestedQuestionWrap>
                            </>
                          )} */}
                        </>
                      </QALayout>
                    </ColoredContainer>
                  );
                })}
              </div>
              {/* if button is loading + chat response and data response arrays are equal length, means the model hasn't returned the SQL query yet, otherwise we'd have chatResponse and a missing dataResponse.*/}
              {buttonLoading &&
              chatResponseArray.length === dataResponseArray.length ? (
                <div
                  style={{
                    background: theme.config.background2,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <QALayout type={"Question"}>
                    <p style={{ margin: 0 }}>{query}</p>
                  </QALayout>

                  <div
                    className="data-loading-search-state"
                    style={{ width: "50%", margin: "0 auto" }}
                  >
                    <SearchState
                      message={"Generating a query for your question..."}
                      lottie={
                        <Lottie animationData={LoadingLottie} loop={true} />
                      }
                    />
                  </div>
                </div>
              ) : (
                ""
              )}

              <SearchWrap loading={buttonLoading} theme={theme.config}>
                <Search
                  placeholder="Ask a question"
                  enterButton={buttonText}
                  size="small"
                  onSearch={handleSubmit}
                  loading={buttonLoading}
                  disabled={buttonLoading}
                />
              </SearchWrap>
            </Panel>
          </Collapse>
        </div>
      </Wrap>
    </ThemeContext.Provider>
  );
};

const Wrap = styled.div`
  position: relative;
  .ant-collapse-content-box {
    padding: 20px !important;

    @media (max-width: 650px) {
      padding: 8px !important;
    }
  }
  .ant-collapse-header {
    display: flex;
    align-items: center;
    color: ${(props) =>
      props.theme ? props.theme.primaryText : "#0D0D0D"} !important;
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"} !important;

    .ant-collapse-extra {
      order: 3;
      margin-left: 8px;
    }
  }
`;

const ColoredContainer = styled.div`
  background: ${(props) => (props.theme ? props.theme.background3 : "#F8FAFB")};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  margin-top: 20px;

  @media (max-width: 767px) {
    padding: 12px;
  }
`;

const SuggestedQuestionWrap = styled.button`
  font-size: 14px;
  margin-top: 4px;
  background: ${(props) => (props.theme ? props.theme.background2 : "#F8FAFB")};
  color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  border-radius: 7px;
  padding: 12px;
  display: inline-block;
  border: none;
  cursor: pointer;
  text-align: left;

  span {
    display: block;
    color: inherit;
    font-weight: 600;
  }
`;

const SearchWrap = styled.div`
  display: flex;
  background: ${(props) =>
    props.loading ? props.theme.disabledColor : props.theme.background2};
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) =>
    props.loading ? props.theme.disabledColor : props.theme.brandColor};
  border-radius: 8px;
  padding: 6px;
  .ant-input-group-wrapper {
    width: 100%;
    .ant-input-wrapper {
      display: flex;
    }

    .ant-input {
      border: none;
      width: calc(100% - 120px);
      background-color: transparent;
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};

      &::placeholder {
        color: ${(props) =>
          props.theme ? props.theme.primaryText : "#0D0D0D"};
        opacity: 0.7;
      }
    }
    .ant-input:focus,
    .ant-input-focused {
      box-shadow: none;
    }
    .ant-input-group-addon {
      button {
        min-height: 36px;
        min-width: 120px;
        border-radius: 6px !important;
        border-color: transparent;
        color: #fff;
        box-shadow: none !important;
        background: ${(props) =>
          props.theme ? props.theme.brandColor : "#2B59FF"};
      }
    }
  }
`;

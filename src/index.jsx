import React, { useState, useRef, useEffect, Fragment } from "react";
import Lottie from "lottie-react";
import { Collapse, AutoComplete, message } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import SearchState from "./components/SearchState";
import LoadingLottie from "./components/svg/loader.json";
import Answers from "./components/Answers";
import { questionModes, reFormatData } from "./components/common/utils";
import QALayout from "./components/common/QALayout";
import {
  ThemeContext,
  darkThemeColor,
  lightThemeColor,
} from "./context/ThemeContext";
import { styled } from "styled-components";
import ThemeSwitchButton from "./components/common/ThemeSwitchButton";

import { createGlobalStyle } from "styled-components";
import { UtilsContext } from "./context/UtilsContext";
import Search from "antd/lib/input/Search";

import test from "./test.json";

export function AskDefogChat({
  apiEndpoint,
  maxHeight = "100%",
  maxWidth = "100%",
  buttonText = "Ask Defog",
  debugMode = false,
  apiKey = null,
  darkMode,
  additionalParams = {},
  additionalHeaders = {},
  sqlOnly = false,
  predefinedQuestions = [],
  mode = "http", // can be "websocket" or "http"
  loadingMessage = "Generating a query for your question...",
  agent = false,
  placeholderText = "",
}) {
  const { Panel } = Collapse;
  const [isActive, setIsActive] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(test);
  const [forceReload, setForceReload] = useState(1);
  const questionMode = questionModes[agent ? 0 : 1];
  const [level0Loading, setLevel0Loading] = useState(false);

  const [query, setQuery] = useState("");
  const divRef = useRef(null);
  const autoCompRef = useRef(null);

  const [theme, setTheme] = useState({
    type: darkMode === true ? "dark" : "light",
    config: darkMode === true ? darkThemeColor : lightThemeColor,
  });

  const GlobalStyle = createGlobalStyle`
  .ant-popover-arrow, ant-popover-arrow-content {
    --antd-arrow-background-color: black;
  }
  // show popovers only in the dropdown menu.
  // don't show popovers on hover on the selected dropdown item itself.
  .ant-select-selection-item {
    // pointer-events: none;
  }
  .italic {
    font-style: italic;
  }
  .underline {
    text-decoration: underline;
  }

  .tool-icon {
    display: inline-block;
    position: relative;
    margin-right: 5px;
    top: 2px;

    svg {
      stroke: ${theme.config.primaryText};
    }
  }
`;

  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16),
    );
  }

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
        : { type: "light", config: lightThemeColor },
    );
  };

  function makeURL(urlPath = "") {
    return apiEndpoint + urlPath;
  }

  function setupWebsocket() {
    comms.current = new WebSocket(apiEndpoint);
  }

  var comms = useRef(null);

  if (mode === "websocket") {
    // if it's not open or not created yet, recreate
    if (!comms.current || comms.current.readyState !== comms.current.OPEN) {
      setupWebsocket();
    }

    // re declare this everytime, otherwise the handlers have closure over state values and never get updated state.
    // we COULD use useCallback here but something for the future perhaps.
    comms.current.onmessage = function (event) {
      const response = JSON.parse(event.data);

      if (response.response_type === "model-completion") {
        handleChatResponse(response, query, agent, false);
      } else if (response.response_type === "generated-data") {
        handleDataResponse(response, query, null, {});
      }
    };
  }

  const handleSubmit = async (
    query,
    parentQuestionId = null,
    previousQuestions = [],
  ) => {
    if (!query?.trim()) {
      // message.error("Please enter a question to search");
      return;
    }

    // setTimeout(() => {
    //   if (autoCompRef.current) {
    //     autoCompRef.current.focus();
    //     autoCompRef.current.blur();
    //   }
    // }, 0);

    setGlobalLoading(true);
    setQuery(query);
    // setTimeout(() => {
    //   const divEl = document.getElementById("results");
    //   {
    //     divEl &&
    //       divEl.scrollTo({
    //         top: divRef.current.scrollHeight,
    //         behavior: "smooth",
    //       });
    //   }
    // }, 100);

    if (mode === "websocket") {
      comms.current.send(
        JSON.stringify({
          question: query,
          previous_context: previousQuestions,
          api_key: apiKey,
        }),
      );
    } else if (mode === "http") {
      let queryChatResponse;
      try {
        queryChatResponse = await fetch(makeURL(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...additionalHeaders,
          },
          body: JSON.stringify({
            question: query,
            previous_context: previousQuestions,
            ...additionalParams,
            api_key: apiKey,
          }),
        }).then((d) => d.json());

        if (queryChatResponse.ran_successfully === false) {
          throw Error(
            `query didn't run successfully. Here's the response received: ${JSON.stringify(
              queryChatResponse,
            )}`,
          );
        }

        handleChatResponse(
          queryChatResponse,
          query,
          agent,
          !agent,
          parentQuestionId,
        );
      } catch (e) {
        // from agents
        if (queryChatResponse?.error_message) {
          message.error(queryChatResponse.error_message);
        } else {
          console.log(e);
          message.error(
            "An error occurred on our server. Sorry about that! We have been notified and will fix it ASAP.",
          );
        }
        setGlobalLoading(false);
        setLevel0Loading(false);
      }
    }
  };

  function handleChatResponse(
    queryChatResponse,
    query,
    agent = false,
    executeData = true,
    parentQuestionId = null,
  ) {
    // parse agent sub_qns in case string
    if (agent && typeof queryChatResponse.sub_qns === "string") {
      try {
        queryChatResponse.sub_qns = queryChatResponse.sub_qns
          ? JSON.parse(queryChatResponse.sub_qns)
          : [];
      } catch (e) {
        console.log(e);
        message.error(
          "An error occurred on our server. Sorry about that! We have been notified and will fix it ASAP.",
        );
        setGlobalLoading(false);
        setLevel0Loading(false);
      }
    }

    // set response array to have the latest everything except data and columns
    const questionId = uuidv4();
    const now = new Date();
    const updatedQuestions = {
      ...questionsAsked,
      [questionId]: {
        question: query,
        sql: queryChatResponse.query_generated || queryChatResponse.code,
        parentQuestionId,
        level: parentQuestionId
          ? questionsAsked[parentQuestionId]?.level + 1
          : 0,
        askedAt: now.toISOString(),
      },
    };

    if ((sqlOnly === false) & executeData) {
      handleDataResponse(
        queryChatResponse,
        query,
        questionId,
        updatedQuestions,
      );
    } else {
      setQuestionsAsked({ ...updatedQuestions });
      setForceReload(forceReload + 1);
    }

    if (sqlOnly === true || agent) {
      setGlobalLoading(false);
      setLevel0Loading(false);
    }
  }

  const handleDataResponse = (
    dataResponse,
    query,
    questionId,
    questionsAsked,
  ) => {
    // remove rows for which every value is null
    const { newRows, newCols } = reFormatData(
      dataResponse?.data,
      dataResponse?.columns,
    );

    const newQuestionsAsked = { ...questionsAsked };
    newQuestionsAsked[questionId].data = newRows;
    newQuestionsAsked[questionId].columns = newCols;
    setQuestionsAsked({ ...newQuestionsAsked });
    setForceReload(forceReload + 1);

    // update the last item in response array with the above data and columns
    setGlobalLoading(false);
    setLevel0Loading(false);

    // scroll to the bottom of the results div
    // setTimeout(() => {
    //   const divEl = document.getElementById("answers");
    //   {
    //     divEl &&
    //       divEl.scrollTo({
    //         top: divEl.scrollHeight - 600,
    //         behavior: "auto",
    //       });
    //   }
    // }, 200);
  };

  const genExtra = () => (
    <ThemeSwitchButton mode={theme.type} handleMode={toggleTheme} />
  );

  return (
    <>
      <GlobalStyle />
      <UtilsContext.Provider
        value={{
          apiKey,
          additionalHeaders,
          additionalParams,
          query,
          apiEndpoint,
        }}
      >
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
                      display: questionsAsked.length === 0 ? "none" : "block",
                    }}
                  >
                    <Answers
                      questionsAsked={questionsAsked}
                      debugMode={debugMode}
                      sqlOnly={sqlOnly}
                      handleSubmit={handleSubmit}
                      globalLoading={globalLoading}
                      forceReload={forceReload}
                      level0Loading={level0Loading}
                    />
                  </div>
                  {/* 
                  if button is loading + chat response and data response arrays are equal length, means the model hasn't returned the SQL query yet for the most recently asked question, otherwise we'd have chatResponse and a missing dataResponse.
                  Hence it won't show up in the chat response array map above.
                  So render an extra layout + lottie loader for the most recently asked question.
                  */}
                  {/* {globalLoading ? (
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
                          message={loadingMessage}
                          lottie={
                            <Lottie animationData={LoadingLottie} loop={true} />
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    ""
                  )} */}
                  <SearchWrap $loading={globalLoading} theme={theme.config}>
                    <AutoComplete
                      style={{ width: "100%" }}
                      options={predefinedQuestions.map((x) => ({
                        label: x,
                        value: x,
                      }))}
                      filterOption={(inputValue, option) =>
                        option?.value
                          .toUpperCase()
                          .indexOf(inputValue.toUpperCase()) !== -1
                      }
                      ref={autoCompRef}
                    >
                      <Search
                        placeholder={
                          placeholderText || questionMode.placeholder
                        }
                        enterButton={buttonText}
                        size="small"
                        onSearch={(query) => {
                          handleSubmit(query, null, []);
                          setLevel0Loading(query);
                        }}
                        loading={globalLoading}
                        disabled={globalLoading}
                      />
                    </AutoComplete>
                  </SearchWrap>
                </Panel>
              </Collapse>
            </div>
          </Wrap>
        </ThemeContext.Provider>
      </UtilsContext.Provider>
    </>
  );
}

const Wrap = styled.div`
  position: relative;

  container-type: inline-size;
  container-name: main-wrap;

  .ant-collapse-content-box {
    padding: 20px !important;

    @container (max-width: 650px) {
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
  .question-mode-select {
    top: 2px;
  }
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

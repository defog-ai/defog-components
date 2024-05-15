import React, { useState, useRef, useEffect, Fragment } from "react";
import Answers from "./components/Answers";
import { questionModes, reFormatData } from "./components/common/utils";
import {
  ThemeContext,
  darkThemeColor,
  lightThemeColor,
} from "./context/ThemeContext";
import { styled } from "styled-components";
import ThemeSwitchButton from "./components/common/ThemeSwitchButton";
import CustomSearch from "./components/CustomSearch";

import { createGlobalStyle } from "styled-components";
import { UtilsContext } from "./context/UtilsContext";

// import test from "./test.json";

export function AskDefogChat({
  apiEndpoint,
  maxHeight = "100%",
  maxWidth = "100%",
  buttonText = "Ask Defog",
  debugMode = false,
  apiKey = null,
  darkMode,
  demoMode = false,
  additionalParams = {},
  additionalHeaders = {},
  sqlOnly = false,
  // predefinedQuestions = [],
  narrativeMode = false,
  mode = "http", // can be "websocket" or "http"
  agent = false,
  placeholderText = "",
  clearOnAnswer = false,
  guidedTeaching = false,
  dev = false,
  chartTypeEndpoint = null,
  feedbackEndpoint = null,
}) {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  // Custom Collapse Panel component will be implemented here
  // const [questionsAsked, setQuestionsAsked] = useState(test);
  const [questionsAsked, setQuestionsAsked] = useState([]);
  const [forceReload, setForceReload] = useState(1);
  const questionMode = questionModes[agent ? 0 : 1];
  const [level0Loading, setLevel0Loading] = useState(false);

  const divRef = useRef(null);
  // const autoCompRef = useRef(null);

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

  var comms = useRef(null);

  const handleSubmit = async (
    query,
    parentQuestionId = null,
    previousQuestions = [],
  ) => {
    if (!query?.trim()) {
      // TODO: Implement a custom alert system or use another library's alert system
      return;
    }

    setGlobalLoading(true);

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
        // TODO: Implement custom alert system or use another library's alert system
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
        analysis: queryChatResponse.analysis || null,
        visualization: queryChatResponse.visualization || "table",
        followUpQuestions: queryChatResponse.followUpQuestions || "",
        debugInfo: queryChatResponse.debug_info || null,
        warnUsers: queryChatResponse.warn_users || null,
      },
    };

    if ((sqlOnly === false) & executeData) {
      handleDataResponse(queryChatResponse, questionId, updatedQuestions);
    } else {
      setQuestionsAsked({ ...updatedQuestions });
      setForceReload(forceReload + 1);
    }

    if (sqlOnly === true || agent) {
      setGlobalLoading(false);
      setLevel0Loading(false);
    }
  }

  const handleDataResponse = async (
    dataResponse,
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

    // call determineChartType function to get chart recommendations
    // this happens in the background and doesn't block the UI
    const chartRecommendations = await determineChartType(
      newCols.map((col) => col.dataIndex),
      query,
    );

    // Update the state with the recommended chart type and axis columns
    newQuestionsAsked[questionId].visualization =
      chartRecommendations.chartType;
    newQuestionsAsked[questionId].xAxisColumns =
      chartRecommendations.xAxisColumns;
    newQuestionsAsked[questionId].yAxisColumns =
      chartRecommendations.yAxisColumns;
    setQuestionsAsked({ ...newQuestionsAsked });
    setForceReload(forceReload + 1);
  };

  const determineChartType = async (columns, question) => {
    let response;
    let chartConfig;

    if (!chartTypeEndpoint) {
      return { chartType: "Table", xAxisColumns: [], yAxisColumns: [] };
    }

    try {
      response = await fetch(chartTypeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          columns: columns,
        }),
      });
      chartConfig = await response.json();

      if (!response.ok) {
        chartConfig = {
          vizType: "table",
          xAxisColumns: [],
          yAxisColumns: [],
        };
      }

      const validChartTypes = ["Bar Chart", "Pie Chart", "Line Chart"];
      let chartType = validChartTypes.includes(chartConfig.vizType)
        ? chartConfig.vizType
        : "Bar Chart";
      let xAxisColumns = chartConfig?.xAxisColumns || [];
      let yAxisColumns = chartConfig?.yAxisColumns || [];

      return { chartType, xAxisColumns, yAxisColumns };
    } catch (error) {
      console.error("Error determining chart type:", error);
      // Default to 'Bar Chart' if there is an error
      return { chartType: "Bar Chart", xAxisColumns: [], yAxisColumns: [] };
    }
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
              {/* Custom Collapse Panel component usage will be implemented here */}
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

  .question-mode-select {
    top: 2px;
  }
  .ant-input-group-wrapper {
    border-radius: 8px;
    padding: 6px;
    border: 1px solid
      ${(props) => (props.theme ? props.theme.brandColor : "#2B59FF")};
    width: 100%;
    .ant-input-wrapper {
      display: flex;
    }

    &.ant-input-group-wrapper-disabled {
      background-color: transparent;
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
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
      &.ant-input-disabled {
        color: rgba(0, 0, 0, 0.25) !important;
        &::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }

        background-color: rgba(0, 0, 0, 0.04);
        border-color: #d9d9d9 !important;
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

        &:disabled {
          border: none !important;
          color: rgba(0, 0, 0, 0.25) !important;
          background-color: rgba(0, 0, 0, 0.04);
          box-shadow: none;
        }
      }
    }
  }
`;

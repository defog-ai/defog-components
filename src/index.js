import React, { useState, useRef, useContext, Fragment } from "react";
import Lottie from "lottie-react";
import { Input, Collapse, message } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import SearchState from "./components/SearchState.js";
import LoadingLottie from "./components/svg/ridinloop_1.json";
import DefogDynamicViz from "./components/DefogDynamicViz.js";
import { inferColumnType } from "./components/common/utils.js";
import Context from "./components/common/Context.js";
import "./main.scss";

export const AskDefogChat = ({
  apiEndpoint,
  maxHeight = "100%",
  maxWidth = "100%",
  buttonText = "Ask Defog",
  debugMode = false,
  personality = "Friendly",
  apiKey,
  additionalParams = {},
  // can be "websocket" or "http"
  mode = "http",
  theme = "light",
}) => {
  const { Search } = Input;
  const { Panel } = Collapse;
  const [isActive, setIsActive] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [widgetHeight, setWidgetHeight] = useState(40);
  const [chatResponseArray, setChatResponseArray] = useState([]);
  const [dataResponseArray, setDataResponseArray] = useState([]);
  const [vizType, setVizType] = useState("table");
  const [rawData, setRawData] = useState([]);
  const [query, setQuery] = useState("");
  const [context, setContext] = useState({ theme: theme });
  const divRef = useRef(null);

  // const generateChatPath = "generate_query_chat";
  // const generateDataPath = "generate_data";

  function makeURL(urlPath = "") {
    return apiEndpoint + urlPath;
  }

  const scrollToDiv = () => {
    divRef.current.scrollTop = divRef.current.scrollHeight;
  };

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
        handleChatResponse(response);
      } else if (response.response_type === "generated-data") {
        handleDataResponse(response);
      }
    };
  }

  const handleSubmit = async (query) => {
    setButtonLoading(true);
    setQuery(query);

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

  function handleChatResponse(queryChatResponse, query) {
    console.log(queryChatResponse);
    // set response array to have the latest everuthing except data and columns
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
    handleDataResponse(queryChatResponse, query);
  }

  function handleDataResponse(dataResponse, query) {
    setRawData(dataResponse.data);
    if (
      query.toLowerCase().indexOf("pie chart") > -1 ||
      query.toLowerCase().indexOf("piechart") > -1
    ) {
      setVizType("piechart");
    } else if (
      query.toLowerCase().indexOf("bar chart") > -1 ||
      query.toLowerCase().indexOf("barchart") > -1 ||
      query.toLowerCase().indexOf("column chart") > -1 ||
      query.toLowerCase().indexOf("columnchart") > -1
    ) {
      setVizType("columnchart");
    } else if (
      query.toLowerCase().indexOf("trend chart") > -1 ||
      query.toLowerCase().indexOf("trendchart") > -1 ||
      query.toLowerCase().indexOf("line chart") > -1 ||
      query.toLowerCase().indexOf("linechart") > -1
    ) {
      setVizType("trendchart");
    } else if (dataResponse.code) {
      setVizType("text");
    } else if (query.toLowerCase().indexOf(" chart ") > -1) {
      setVizType("columnchart");
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

    if (dataResponse.columns && dataResponse?.data.length > 0) {
      const cols = dataResponse.columns;
      const colVariableTypes = dataResponse.column_variable_types;
      const rows = dataResponse.data;
      newCols = [];
      newRows = [];
      for (let i = 0; i < cols.length; i++) {
        newCols.push(
          Object.assign(
            {
              title: cols[i],
              dataIndex: cols[i],
              key: cols[i],
              variableType: colVariableTypes[cols[i]],
              // simple typeof. if a number is coming in as string, this will be string.
              simpleTypeOf: typeof rows[0][i],
              sorter:
                rows.length > 0 && typeof rows[0][i] === "number"
                  ? (a, b) => a[cols[i]] - b[cols[i]]
                  : (a, b) =>
                      String(a[cols[i]]).localeCompare(String(b[cols[i]])),
            },
            inferColumnType(rows, i)
          )
        );
        if (newCols[i].numeric && newCols[i].simpleTypeOf === "string") {
          numericAsString.push(i);
        }
      }

      for (let i = 0; i < rows.length; i++) {
        let row = {};
        for (let j = 0; j < cols.length; j++) {
          if (numericAsString.indexOf(j) >= 0) {
            row[cols[j]] = +rows[i][j];
          } else row[cols[j]] = rows[i][j];
        }
        rows["key"] = i;
        newRows.push(row);
      }
    } else {
      newCols = [];
      newRows = [];
    }

    // update the last item in response array with the above data and columns
    setDataResponseArray([
      ...dataResponseArray,
      {
        data: newRows,
        columns: newCols,
      },
    ]);

    setWidgetHeight(400);

    setButtonLoading(false);

    // scroll to the bottom of the results div
    const resultsDiv = document.getElementById("results");
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
  }

  return (
    <Context.Provider value={[context, setContext]}>
      <div>
        <div
          style={{
            padding: 0,
            color: "#fff",
            border: "1px solid lightgrey",
            borderRadius: 10,
          }}
        >
          {/* add a button on the top right of this div with an expand arrow */}
          <Collapse
            bordered={false}
            defaultActiveKey={["1"]}
            expandIconPosition="end"
            style={{ color: "#fff", backgroundColor: "#fff" }}
            expandIcon={() => (
              <CaretRightOutlined rotate={isActive ? 270 : 90} />
            )}
            onChange={(state) =>
              state.length > 1 ? setIsActive(true) : setIsActive(false)
            }
          >
            <Panel header={buttonText} key="1" style={{ color: "#fff" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  overflow: "auto",
                }}
                id="results"
                ref={divRef}
              >
                {chatResponseArray.map((response, index) => {
                  return (
                    <div key={index}>
                      <hr style={{ borderTop: "1px dashed lightgrey" }} />
                      <p style={{ marginTop: 10 }}>{response.question}</p>
                      <p style={{ color: "grey", fontSize: 12, marginTop: 10 }}>
                        {response.queryReason}
                      </p>
                      {!dataResponseArray[index] ? (
                        <div
                          className="data-loading-search-state"
                          style={{ width: "50%", margin: "0 auto" }}
                        >
                          <SearchState
                            message={"Query generated! Getting your data..."}
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
                      <p style={{ color: "grey", fontSize: 12, marginTop: 10 }}>
                        {response.suggestedQuestions}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* if button is loading + chat response and data response arrays are equal length, means the model hasn't returned the SQL query yet, otherwise we'd have chatResponse and a missing dataResponse.*/}
              {buttonLoading &&
              chatResponseArray.length === dataResponseArray.length ? (
                <React.Fragment>
                  <hr style={{ borderTop: "1px dashed lightgrey" }} />
                  <p style={{ marginTop: 10 }}>{query}</p>
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
                </React.Fragment>
              ) : (
                ""
              )}
              <Search
                placeholder="input search text"
                allowClear
                enterButton={buttonText}
                size="large"
                onSearch={handleSubmit}
                style={{ width: "100%", maxWidth: 600 }}
                loading={buttonLoading}
                disabled={buttonLoading}
              />
            </Panel>
          </Collapse>
        </div>
      </div>
    </Context.Provider>
  );
};

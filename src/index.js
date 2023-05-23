import React, { useState, useRef, Fragment } from "react";
import Lottie from "lottie-react";
import { Input, Row, Col, Collapse, message } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import SearchState from "./components/SearchState.js";
import ErrorSvg from "./components/svg/ErrorSvg.js";
import LoadingLottie from "./components/svg/ridinloop_1.json";
import DefogViz from "./components/DefogViz.js";
import DefogDynamicViz from "./components/DefogDynamicViz.js";
import styled from "styled-components";
import { inferColumnType } from "./components/common/utils.js";

export const AskDefogChat = ({
  apiEndpoint,
  maxHeight = "100%",
  maxWidth = "100%",
  buttonText = "Ask Defog",
  debugMode = false,
  apiKey,
  additionalParams = {},
  // can be "websocket" or "http"
  mode = "http",
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
  const divRef = useRef(null);

  // const generateChatPath = "generate_query_chat";
  // const generateDataPath = "generate_data";

  function makeURL(urlPath="") {
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
          }),
        }).then((d) => d.json());
  
        handleChatResponse(queryChatResponse, query);
      } catch (e) {
        console.log(e);
        message.error("An error occurred on our server. Sorry about that! We have been notified and will fix it ASAP.");
      }

      // fetch(makeURL(generateDataPath), {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     sql_query: queryChatResponse.query_generated,
      //   }),
      // })
      //   .then((d) => d.json())
      //   .then(handleDataResponse);
    }
  };

  function handleChatResponse(queryChatResponse, query) {
    // set response array to have the latest everuthing except data and columns
    setChatResponseArray([
      ...chatResponseArray,
      {
        queryReason: queryChatResponse.reason_for_query,
        suggestedQuestions: queryChatResponse.suggestion_for_further_questions,
        question: query,
        generatedSql: queryChatResponse.query_generated || queryChatResponse.code,
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
    }
    else {
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
          defaultActiveKey={['1']}
          expandIconPosition="end"
          style={{ color: "#fff", backgroundColor: "#fff" }}
          expandIcon={() => <CaretRightOutlined rotate={isActive ? 270 : 90} />}
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
                            <Lottie animationData={LoadingLottie} loop={true} />
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
  );
};

export const AskDefog = ({ showQuery, maxHeight, apiEndpoint }) => {
  const [query, setQuery] = useState("");
  const [previousQuery, setPreviousQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultState, setResultState] = useState("IDLE");
  const [cols, setCols] = useState([]);
  const [sql, setSql] = useState(null);
  const [data, setData] = useState([]);
  const [vizType, setVizType] = useState("table");
  const { Search } = Input;

  const handleQuestionInput = async (question) => {
    setQuery(question);
    setLoading(true);
    setResultState("LOADING");

    const listToNumberedString = (list) => {
      if (list === null) {
        return null;
      }
      let numberedString = "";
      for (let i = 0; i < list.length; i++) {
        numberedString += `${i + 1}. ${list[i]}\n`;
      }
      return numberedString;
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        // previous_question: listToNumberedString(previousQuery),
      }),
    });
    const data = await response.json();
    if (!data.ran_successfully) {
      message.error(
        "An error occurred on our backend. We'll fix it as soon as we can."
      );
    }
    if (data.columns) {
      const cols = data.columns;
      const rows = data.data;
      setVizType("table");
      setData(rows);
      setCols(cols);
      if (previousQuery) {
        setPreviousQuery([...previousQuery, question]);
      } else {
        setPreviousQuery([question]);
      }
    }
    setSql(data.query_generated);
    setLoading(false);

    if (data.ran_successfully) {
      setResultState("SUCCESS");
    } else {
      setResultState("ERROR");
    }
  };

  return (
    <TryWrap maxHeight={maxHeight}>
      <Col span={24}>
        {/* select a table from a dropdown list */}
        <h3>Ask a question of the data</h3>
        <div className="searchDataWrap">
          <Search
            placeholder="ask a question of the data"
            allowClear
            enterButton="Ask Defog"
            value={query}
            onSearch={handleQuestionInput}
            onChange={(e) => setQuery(e.target.value)}
            loading={loading}
          />
        </div>

        {resultState === "IDLE" ? null : (
          <div>
            {resultState === "LOADING" && (
              <SearchState
                message="On our way to finding some results"
                lottie={<Lottie animationData={LoadingLottie} loop={true} />}
              />
            )}

            {resultState === "SUCCESS" && (
              <div>
                <div>
                  <div className="generatedDateWrap">
                    {showQuery ? (
                      <div className="generatedDate-heading">
                        <b>Generated SQL</b>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{sql}</pre>
                      </div>
                    ) : null}
                    <DefogViz columns={cols} data={data} vizType={vizType} />

                    <Row>
                      {/* when you click on these buttons, a modal should pop up where you can specify which columns you want to have on your X/Y axes. Right now, this can be a tedious manual thing. Over time, this can be done automatically (maybe with a thin layer of ML) */}
                      {/* <Button onClick={openLineChartModal}>
                        <LineChartOutlined />
                      </Button>
                      <Button onClick={openBarChartModal}>
                        <BarChartOutlined />
                      </Button>
                      <Button onClick={openPieChartModal}>
                        <PieChartOutlined />
                      </Button> */}
                      {/* <Button onClick={openTreeMapModal}>
            <HeatMapOutlined/>
          </Button> */}
                    </Row>
                  </div>
                </div>
              </div>
            )}

            {resultState === "ERROR" && (
              <SearchState type="error" svg={<ErrorSvg />}>
                <b weight={700}>
                  <p fs="1.4rem">We failed to process your query.</p>
                  Try rephrasing your query to give our model a second chance?
                </b>
                {showQuery ? (
                  <div>
                    <b>SQL Generated (Failed)</b>
                    <pre>{sql}</pre>
                  </div>
                ) : null}
              </SearchState>
            )}
          </div>
        )}
      </Col>
    </TryWrap>
  );
};

const TryWrap = styled.div`
  background: #ffffff;
  box-shadow: 0px 52.1361px 75.3077px rgba(0, 0, 0, 0.08);
  border-radius: 8.66667px;
  padding: 2.8rem;
  position: relative;
  max-height: ${(props) => props.maxHeight}px;
  overflow-y: auto;
  @media (max-width: 767px) {
    padding: 1.2rem;
  }
  h3 {
    margin-bottom: 0.8rem;
  }
  .selectNote {
    font-size: 12px;
    margin-bottom: 2rem;
    padding: 0.4rem;
    padding-top: 0.8rem;
  }
  .searchDataWrap {
    .ant-btn-primary {
      min-width: 12rem;
      justify-content: center;
    }
  }
  .sampleQuesBtnWrap {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.2rem;
    button {
      white-space: nowrap;
      border: none;
      background: #e3e9ff;
      border-radius: 5px;
      padding: 8px;
      display: inline-block;
      font-size: 1.2rem;
      cursor: pointer;
    }
  }
  .searchDataLoading {
    margin-top: 2rem;
    background-color: #fafafc;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 5vw;
    h3 {
      font-size: 2rem;
      margin-top: 1.2rem;
    }
    svg {
      display: block;
    }
  }
  .generatedDateWrap {
    margin-top: 2.4rem;
    background: #fafafc;
    padding: 1.2rem;
    .generatedDate-heading {
      text-align: center;
      padding-bottom: 2rem;
      h3 {
        font-size: 2rem;
      }
      pre {
        font-family: monospace;
      }
    }
    .ant-table-thead tr th {
      background: #e3e9ff;
    }
  }
  .embedLogo {
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 0rem;
    left: 0;
    width: 100%;
    padding: 0.8rem;
    background-color: #ffffff;
  }
`;

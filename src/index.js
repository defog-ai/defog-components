import React, { useState, useRef } from "react";
import Lottie from "lottie-react";
import { Input, Row, Col, Collapse, message } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import SearchState from "./components/SearchState.js";
import ErrorSvg from "./components/svg/ErrorSvg.js";
import LoadingLottie from "./components/svg/ridinloop_1.json";
import DefogViz from "./components/DefogViz.js";
import DefogDynamicViz from "./components/DefogDynamicViz.js";
import styled from "styled-components";
import { inferColumnType, isDate } from "./components/common/utils.js";

export const AskDefogChat = ({
  apiEndpoint = "https://test-defog-chrome-ext-ikcpfh5tva-uc.a.run.app",
  maxHeight = "100%",
  maxWidth = "100%",
  buttonText = "Ask Defog",
  debugMode = false,
  apiKey,
}) => {
  const { Search } = Input;
  const { Panel } = Collapse;
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [widgetHeight, setWidgetHeight] = useState(40);
  const [responseArray, setResponseArray] = useState([]);
  const [vizType, setVizType] = useState("table");
  const [rawData, setRawData] = useState([]);
  const [query, setQuery] = useState("");
  const divRef = useRef(null);

  const scrollToDiv = () => {
    divRef.current.scrollTop = divRef.current.scrollHeight;
  };

  const handleSubmit = async (query) => {
    setLoading(true);
    setQuery(query);
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: query,
        previous_context: previousQuestions,
      }),
    });
    const data = await response.json();
    setRawData(data.data);
    console.log(data);

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
    } else {
      setVizType("table");
    }

    let newCols;
    let newRows;
    if (data.columns && data?.data.length > 0) {
      const cols = data.columns;
      const rows = data.data;
      newCols = [];
      newRows = [];
      for (let i = 0; i < cols.length; i++) {
        newCols.push({
          title: cols[i],
          dataIndex: cols[i],
          key: cols[i],
          colType: inferColumnType(rows, i),
          sorter:
            rows.length > 0 && typeof rows[0][i] === "number"
              ? (a, b) => a[cols[i]] - b[cols[i]]
              : (a, b) => String(a[cols[i]]).localeCompare(String(b[cols[i]])),
        });
      }
      for (let i = 0; i < rows.length; i++) {
        let row = {};
        for (let j = 0; j < cols.length; j++) {
          row[cols[j]] = rows[i][j];
        }
        rows["key"] = i;
        newRows.push(row);
      }
    } else {
      newCols = [];
      newRows = [];
    }
    setResponseArray([
      ...responseArray,
      {
        queryReason: data.query_explanation,
        data: newRows,
        columns: newCols,
        suggestedQuestions: data.suggestion_for_further_questions,
        question: query,
        generatedSql: data.query_generated,
        previousContext: previousQuestions,
      },
    ]);

    const contextQuestions = [query, data.query_generated];
    setPreviousQuestions([...previousQuestions, ...contextQuestions]);
    setWidgetHeight(400);
    setLoading(false);

    // scroll to the bottom of the results div
    const resultsDiv = document.getElementById("results");
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
  };

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
          defaultActiveKey={[null]}
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
              {responseArray.map((response, index) => {
                return (
                  <div key={index}>
                    <hr style={{ borderTop: "1px dashed lightgrey" }} />
                    <p style={{ marginTop: 10 }}>{response.question}</p>
                    <p style={{ color: "grey", fontSize: 12, marginTop: 10 }}>
                      {response.queryReason}
                    </p>
                    <DefogDynamicViz
                      vizType={vizType}
                      response={response}
                      rawData={rawData}
                      query={query}
                      debugMode={debugMode}
                      apiKey={apiKey}
                    />
                    <p style={{ color: "grey", fontSize: 12, marginTop: 10 }}>
                      {response.suggestedQuestions}
                    </p>
                  </div>
                );
              })}
            </div>
            <Search
              placeholder="input search text"
              allowClear
              enterButton={buttonText}
              size="large"
              onSearch={handleSubmit}
              style={{ width: 600 }}
              loading={loading}
              disabled={loading}
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

import React, { useState, useContext, Fragment } from "react";
import { Button, Table, message, Tabs, Modal, Input } from "antd";
import {
  download_csv,
  processData,
  roundColumns,
  transformToCSV,
} from "./common/utils.js";
import { TableOutlined, BarChartOutlined } from "@ant-design/icons";
import ChartContainer from "./ChartContainer.jsx";
import Context from "./common/Context.js";

const DefogDynamicViz = ({
  vizType = null,
  response,
  rawData,
  query,
  debugMode,
  apiKey,
}) => {
  const [theme, setTheme] = useContext(Context);
  const [narrative, setNarrative] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { TextArea } = Input;

  console.log(theme);

  const uploadFeedback = (feedback, feedbackText = "") => {
    if (feedback === "Good") {
      fetch(`https://api.defog.ai/feedback`, {
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
    } else {
      fetch(`https://api.defog.ai/feedback`, {
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

      setModalVisible(false);
    }

    feedback === "Good"
      ? message.success(
          "We are glad that this was a good result. Thank you for the feedback!"
        )
      : message.info(
          "Thank you for the feedback, we will use your feedback to make the results better!"
        );
  };

  let results;
  let defaultActiveKey = vizType === null || vizType === "table" ? "1" : "2";

  if (vizType === "text") {
    results = <pre>{response.results}</pre>;
  } else {
    // always have a table
    // round decimal cols to 2 decimal places
    const roundedData = roundColumns(response.data, response.columns);

    results = [
      <Table
        dataSource={roundedData}
        columns={response.columns}
        style={{
          maxHeight: 300,
          overflow: "auto",
        }}
        size="small"
        pagination={{ pageSize: 5 }}
      />,
    ];

    const height = 400;

    const {
      xAxisColumns,
      categoricalColumns,
      yAxisColumns,
      xAxisColumnValues,
      dateColumn,
    } = processData(response.data, response.columns);

    results.push(
      <ChartContainer
        xAxisColumns={xAxisColumns}
        dateColumn={dateColumn}
        categoricalColumns={categoricalColumns}
        yAxisColumns={yAxisColumns}
        xAxisColumnValues={xAxisColumnValues}
        vizType={vizType}
        data={response.data}
        columns={response.columns}
        title={query}
      ></ChartContainer>
    );

    // convert to antd tabs
    results = (
      <Tabs
        defaultActiveKey={vizType === "table" ? "0" : "1"}
        items={results.map((d, i) => ({
          key: String(i),
          label: (
            <span>
              {i === 0 ? <TableOutlined /> : <BarChartOutlined />}
              {i === 0 ? "Table" : "Chart"}
            </span>
          ),
          children: d,
        }))}
      ></Tabs>
    );
  }

  const csvDownload = (
    <>
      <Button
        onClick={() =>
          download_csv(
            transformToCSV(
              rawData,
              response.columns.map((d) => d.title)
            )
          )
        }
      >
        Download CSV
      </Button>

      <Button
        loading={narrativeLoading}
        onClick={async () => {
          setNarrativeLoading(true);
          const resp = await fetch(
            `https://api.defog.ai/generate_data_insights`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                apiKey: apiKey,
                data: {
                  data: rawData,
                  columns: response.columns,
                },
              }),
            }
          );
          const data = await resp.json();
          setNarrative(data.response);
          setNarrativeLoading(false);
        }}
      >
        Get Narrative
      </Button>
    </>
  );

  return (
    <>
      <Modal
        title="To improve the model, could you please give more details about why this is a bad query? :)"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <TextArea rows={4} id="feedback-text" placeholder="Optional" />
        <Button
          onClick={() => {
            uploadFeedback(
              "Bad",
              document.getElementById("feedback-text").value
            );
          }}
        >
          Submit
        </Button>
      </Modal>
      <div>
        {results}
        {csvDownload}
        {debugMode && (
          <div className="rateQualityContainer">
            <p>The following query was generated:</p>
            <pre>{response.generatedSql}</pre>
            <p>How did we do with is this query?</p>
            <button
              style={{ backgroundColor: "#fff", border: "0px" }}
              onClick={() => uploadFeedback("Good")}
            >
              👍 Good{" "}
            </button>
            <button
              style={{ backgroundColor: "#fff", border: "0px" }}
              onClick={() => setModalVisible(true)}
            >
              👎 Bad{" "}
            </button>
          </div>
        )}
      </div>
      <div>{narrative}</div>
    </>
  );
};

export default React.memo(DefogDynamicViz, () => true);

import React, { useState, Fragment } from "react";
import { Button, Table, message, Tabs } from "antd";
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from "./Charts/ColumnChart.jsx";
import TrendChartNew from "./Charts/TrendChartNew.jsx";
import { download_csv, roundColumns, transformToCSV } from "./common/utils.js";
import { TableOutlined, BarChartOutlined } from "@ant-design/icons";

const DefogDynamicViz = ({
  vizType,
  response,
  rawData,
  query,
  debugMode,
  apiKey,
}) => {
  const [narrative, setNarrative] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const uploadFeedback = (feedback) => {
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

    feedback === "Good"
      ? message.success(
          "We are glad that this was a good result. Thank you for the feedback!"
        )
      : message.info(
          "Thank you for the feedback, we will use your feedback to make the results better!"
        );
  };

  let results;
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

    // if there's a viztype specified, show that
    if (vizType === "piechart") {
      results.push(
        <PieChart
          data={{
            // dataJSON: rawData.map((el) => ({ name: el[0], y: el[1] })),
            data: rawData,
            columns: response.columns,
            title: query,
          }}
          height={400}
        />
      );
    } else if (vizType === "columnchart") {
      results.push(
        <ColumnChart
          data={{
            // dataJSON: rawData.map((el) => ({ x: el[0], y: el[1] })),
            data: rawData,
            columns: response.columns,
            // xAxisCategories: rawData.map((el) => el[0]),
            title: query,
          }}
          height={400}
        />
      );
    } else if (vizType === "trendchart") {
      results.push(
        <TrendChartNew
          data={{
            data: rawData,
            columns: response.columns,
            title: query,
          }}
          height={400}
        />
      );
    } else {
      // by default, show line chart
      results.push(
        <TrendChartNew
          data={{
            data: rawData,
            columns: response.columns,
            title: query,
          }}
          height={400}
        />
      );
    }
    // convert to antd tabs
    results = (
      <Tabs
        defaultActiveKey="2"
        items={results.map((d, i) => ({
          key: i,
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

  console.log(response);

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
              onClick={() => uploadFeedback("Bad")}
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

import React, { Fragment, useState } from "react";
import { Button, Table, message } from "antd";
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from "./Charts/ColumnChart.jsx";
import TrendChartNew from "./Charts/TrendChartNew.jsx";
import { download_csv, transformToCSV } from "./common/utils.js";

const DefogDynamicViz = ({
  vizType,
  response,
  rawData,
  query,
  debugMode,
  apiKey,
}) => {
  let results;
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

  if (vizType === "table") {
    results = (
      <Table
        dataSource={response.data}
        columns={response.columns}
        style={{
          maxHeight: 300,
          overflow: "auto",
        }}
        size="small"
        pagination={{ pageSize: 5 }}
      />
    );
  } else if (vizType === "piechart") {
    results = (
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
    results = (
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
    results = (
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

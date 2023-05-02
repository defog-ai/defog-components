import React from "react";
import { Table } from "antd";
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from "./Charts/ColumnChart.jsx";
import TrendChartNew from "./Charts/TrendChartNew.jsx";

const DefogDynamicViz = ({ vizType, response, rawData, query }) => {
  return vizType === "table" ? (
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
  ) : vizType === "piechart" ? (
    <PieChart
      data={{
        // dataJSON: rawData.map((el) => ({ name: el[0], y: el[1] })),
        data: rawData,
        columns: response.columns,
        title: query,
      }}
      height={400}
    />
  ) : vizType === "columnchart" || vizType === "barchart" ? (
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
  ) : vizType === "trendchart" ? (
    <TrendChartNew
      data={{
        data: rawData,
        columns: response.columns,
        title: query,
      }}
      height={400}
    />
  ) : null;
};

export default React.memo(DefogDynamicViz, () => true);

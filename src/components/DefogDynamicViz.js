import React from "react";
import { Table } from "antd";
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from "./Charts/ColumnChart.jsx";
import TrendChart from "./Charts/TrendChart.jsx";

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
        dataJSON: rawData.map((el) => ({ name: el[0], y: el[1] })),
        title: query,
      }}
      height={400}
    />
  ) : vizType === "columnchart" || vizType === "barchart" ? (
    <ColumnChart
      resourceId={null}
      data={{
        dataJSON: rawData.map((el) => ({ x: el[0], y: el[1] })),
        // xAxisCategories: rawData.map((el) => el[0]),
        title: query,
      }}
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  ) : vizType === "trendchart" ? (
    <TrendChart
      resourceId={null}
      data={{
        dataJSON: rawData,
        title: query,
      }}
      transformMode="base"
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  ) : null;
};

export default React.memo(DefogDynamicViz, () => true);

import React from "react";
import { Tabs, Table } from "antd";
import ChartContainer from "./ChartContainer";
import { processData, roundColumns } from "./common/utils";
import { TableOutlined, BarChartOutlined } from "@ant-design/icons";
import ErrorBoundary from "./common/ErrorBoundary";

export function TableChart({ response, query = "", vizType = "table" }) {
  // always have a table
  // round decimal cols to 2 decimal places
  const roundedData = roundColumns(response.data, response.columns);

  let results = [
    <Table
      key="0"
      dataSource={roundedData}
      // don't show index column in table
      columns={response.columns.filter((d) => d.title !== "index")}
      scroll={{ x: "max-content" }}
      style={{
        maxHeight: 300,
      }}
      size="small"
      pagination={{ pageSize: 5, showSizeChanger: false }}
    />,
  ];

  const {
    xAxisColumns,
    categoricalColumns,
    yAxisColumns,
    xAxisColumnValues,
    dateColumns,
  } = processData(response.data, response.columns);

  results.push(
    <ErrorBoundary>
      <ChartContainer
        xAxisColumns={xAxisColumns}
        dateColumns={dateColumns}
        categoricalColumns={categoricalColumns}
        yAxisColumns={yAxisColumns}
        xAxisColumnValues={xAxisColumnValues}
        data={response.data}
        columns={response.columns}
        title={query}
        key="1"
        vizType={vizType === "table" ? "Bar Chart" : vizType}
      ></ChartContainer>
    </ErrorBoundary>
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

  return results;
}
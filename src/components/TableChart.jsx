import React, { isValidElement, Fragment } from "react";
import { Tabs, Table } from "antd";
import ChartContainer from "./ChartContainer";
import { chartNames, processData, roundColumns } from "./common/utils";
import { TableOutlined, BarChartOutlined } from "@ant-design/icons";
import ErrorBoundary from "./common/ErrorBoundary";
import ChartImage from "./ChartImage";

export function TableChart({
  response,
  query = "",
  vizType = "table",
  chartImages = [],
  sql = "",
  // 2d array of {component: ReactComponent, tabLabel: string]
  // both component and tabLabel are mandatory fields
  extraTabs = [],
}) {
  // always have a table
  // round decimal cols to 2 decimal places
  const roundedData = roundColumns(response.data, response.columns);

  // extra tabs should be an array and all elements should be jsx components
  if (
    !extraTabs ||
    !Array.isArray(extraTabs) ||
    !extraTabs.every((d) => d.component && d.tabLabel) ||
    !extraTabs.every((d) => isValidElement(d.component))
  ) {
    extraTabs = [];
  }

  let results = [
    {
      component: (
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
        />
      ),
      tabLabel: "Table",
      icon: <TableOutlined />,
    },
  ];
  if (!chartImages || chartImages.length <= 0) {
    const {
      xAxisColumns,
      categoricalColumns,
      yAxisColumns,
      xAxisColumnValues,
      dateColumns,
    } = processData(response.data, response.columns);

    results.push({
      component: (
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
      ),
      tabLabel: "Chart",
      icon: <BarChartOutlined />,
    });
  } else {
    // if chartImagePath is present, load the image of the chart instead
    results.push({
      component: (
        <ErrorBoundary>
          <ChartImage images={chartImages} />
        </ErrorBoundary>
      ),
      tabLabel: chartNames[chartImages[0].type] || "Chart",
    });
  }
  if (sql && sql.length > 0) {
    // show the sql query
    results.push({
      component: (
        <ErrorBoundary>
          <>
            <p>The following query was generated:</p>
            <pre>{sql}</pre>
          </>
        </ErrorBoundary>
      ),
      tabLabel: "Code",
    });
  }

  // push extra tabs
  results = results.concat(extraTabs);

  // convert to antd tabs
  results = (
    <Tabs
      defaultActiveKey={!chartImages || !chartImages.length ? "0" : "1"}
      items={results.map((d, i) => ({
        key: String(i),
        label: (
          <span>
            {d.icon ? d.icon : null}
            {d.tabLabel ? d.tabLabel : `Tab-${i}`}
          </span>
        ),
        children: d.component,
      }))}
    ></Tabs>
  );

  return results;
}

import React, { isValidElement, Fragment } from "react";
import ChartContainer from "./ChartContainer";
import { chartNames, processData, roundColumns } from "./common/utils";
import ErrorBoundary from "./common/ErrorBoundary";
import ChartImage from "./ChartImage";
import CustomTable from "./CustomTable";

export function TableChart({
  response,
  query = "",
  vizType = "table",
  chartImages = [],
  sql = "",
  extraTabs = [],
  recommendedXAxisColumns = [],
  recommendedYAxisColumns = [],
}) {
  const roundedData = roundColumns(response.data, response.columns);

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
        <CustomTable
          columns={response.columns.map((col) => ({
            key: col.name,
            title: col.name,
            dataIndex: col.name,
          }))}
          data={roundedData}
          maxHeight={300}
        />
      ),
      tabLabel: "Table",
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
            recommendedXAxisColumns={recommendedXAxisColumns}
            recommendedYAxisColumns={recommendedYAxisColumns}
          ></ChartContainer>
        </ErrorBoundary>
      ),
      tabLabel: "Chart",
    });
  } else {
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

  results = results.concat(extraTabs);

  // TODO: Replace with custom tabs component once implemented
  results = (
    <div>
      {/* Custom tabs implementation */}
      {results.map((result, index) => (
        <Fragment key={index}>
          <div>{result.tabLabel}</div>
          <div>{result.component}</div>
        </Fragment>
      ))}
    </div>
  );

  return results;
}

import React, { isValidElement, Fragment } from "react";
// Removed antd imports
import ChartContainer from "./ChartContainer";
import { chartNames, processData, roundColumns } from "./common/utils";
// Removed antd icon imports
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
  recommendedXAxisColumns = [],
  recommendedYAxisColumns = [],
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

  // first add table to the results
  let results = [
    {
      component: (
        // Custom table component to be created or integrated
        <div>
          {/* Custom table implementation */}
          {/* Replace antd Table with custom table component */}
        </div>
      ),
      tabLabel: "Table",
      // Replace antd icons with custom icons or remove if not needed
      icon: null, // Placeholder for custom icon if needed
    },
  ];

  // then add chart to the results
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
      // Replace antd icons with custom icons or remove if not needed
      icon: null, // Placeholder for custom icon if needed
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
      // Removed icon since it's an image
    });
  }
  // finally, add sql to the results, if needed
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
      // Removed icon since it's code
    });
  }

  // push extra tabs
  results = results.concat(extraTabs);

  // convert to custom tabs or another non-antd tab solution
  // Custom tabs component to be created or integrated
  results = (
    <div>
      {/* Custom tabs implementation */}
      {/* Replace antd Tabs with custom tabs component */}
    </div>
  );

  return results;
}

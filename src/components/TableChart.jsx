import React, { useState } from "react";
import ChartContainer from "./ChartContainer";
import { chartNames, processData, roundColumns } from "./common/utils";
import ErrorBoundary from "./common/ErrorBoundary";
import ChartImage from "./ChartImage";
import CustomTable from "./CustomTable";
import CustomTabs from "./CustomTabs";

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
  const [activeTab, setActiveTab] = useState(0);
  const roundedData = roundColumns(response.data, response.columns);

  if (
    !extraTabs ||
    !Array.isArray(extraTabs) ||
    !extraTabs.every((d) => d.component && d.tabLabel)
  ) {
    extraTabs = [];
  }

  let tabsContent = [
    {
      key: 'table',
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

    tabsContent.push({
      key: 'chart',
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
    tabsContent.push({
      key: 'chartImage',
      component: (
        <ErrorBoundary>
          <ChartImage images={chartImages} />
        </ErrorBoundary>
      ),
      tabLabel: chartNames[chartImages[0].type] || "Chart",
    });
  }

  if (sql && sql.length > 0) {
    tabsContent.push({
      key: 'code',
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

  tabsContent = tabsContent.concat(extraTabs.map((tab, index) => ({
    ...tab,
    key: `extraTab-${index}`,
  })));

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  return (
    <CustomTabs
      tabs={tabsContent}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}

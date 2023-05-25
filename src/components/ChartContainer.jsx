import { Select } from "antd";
import React, { Fragment, useMemo, useReducer } from "react";
import { cleanString, transformToChartJSType } from "./common/utils";

export default function ChartContainer({
  xAxisColumn,
  categoricalColumns,
  yAxisColumns,
  categoricalColumnValues,
  vizType,
  data,
  columns,
  title,
  xAxisIsDate,
}) {
  // convert categorical column values to antd's select options
  const opts = {};
  for (let col in categoricalColumnValues) {
    opts[col] = categoricalColumnValues[col].map((d) => ({
      label: d,
      value: col.colType === "string" ? cleanString(d) : d,
    }));
  }

  // initialise with single selects
  const initSelects = useMemo(
    () =>
      categoricalColumns.reduce((obj, d) => {
        obj[d.key] = [opts[d.key][0]];
        return obj;
      }, {}),
    [categoricalColumnValues]
  );

  const updater = (oldState, { key, val }) => {
    const newVals = {};
    newVals[key] = val;

    return Object.assign({}, oldState, newVals);
  };

  const [selectedValues, updateSelectedValues] = useReducer(
    updater,
    initSelects
  );

  // make dropdowns for each categoricalColumn with the values as the options
  const dropdowns = categoricalColumns.map((col) => {
    console.log(selectedValues[col.key]);
    return (
      <div key={col.key}>
        <h4>{col.title}</h4>
        <Select
          mode="multiple"
          options={opts[col.key]}
          value={selectedValues[col.key]}
          onChange={(_, opt) =>
            updateSelectedValues({ key: col.key, val: opt })
          }
        ></Select>
      </div>
    );
  });

  // create viz data based on selectedValues
  let idx = new Set();

  for (let col in selectedValues) {
    selectedValues[col].map((val) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i][col] === val.label) {
          idx.add(i);
        }
      }
    });
  }
  const chartData = Array.from(idx).map((i) => data[i]);

  const chartJS = transformToChartJSType(
    chartData,
    xAxisColumn,
    yAxisColumns,
    categoricalColumns,
    xAxisIsDate
  );

  console.log(chartJS);

  // if there's a viztype specified, show that
  // if (vizType === "piechart") {
  //   results.push(<PieChart data={vizData} height={height} />);
  // } else if (vizType === "columnchart") {
  //   results.push(<ColumnChart data={vizData} height={height} />);
  // } else if (vizType === "trendchart" || vizType === null) {
  //   results.push(<TrendChartNew data={vizData} height={height} />);
  // } else {
  //   // by default, show line chart
  //   results.push(<ColumnChart data={vizData} height={height} />);
  // }
  return <>{dropdowns}</>;
}

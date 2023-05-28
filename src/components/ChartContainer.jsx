import { Select } from "antd";
import React, { useEffect, useState, Fragment, useRef } from "react";
import { cleanString, createChartConfig, isEmpty } from "./common/utils";
import PieChart from "./Charts/PieChart";
import ColumnChart from "./Charts/ColumnChart";
import TrendChartNew from "./Charts/TrendChartNew";
import styled from "styled-components";

function arrToAntD(arr, labelProp = "key", valueProp = "key") {
  return arr.map((d) => ({
    label: labelProp ? d[labelProp] : d,
    value: valueProp ? d[valueProp] : d,
    __data__: d,
  }));
}

const nullChartConfig = { chartLabels: [], chartData: [] };

export default function ChartContainer({
  xAxisColumns,
  dateColumn,
  yAxisColumns,
  xAxisColumnValues,
  data,
  title,
  theme,
}) {
  if (!data || !data.length) {
    return <></>;
  }

  // convert categorical column values to antd's select options
  const opts = useRef(
    xAxisColumns.reduce((obj, col) => {
      const colName = col.key;

      obj[colName] = xAxisColumnValues[colName].map((d) => ({
        label: d,
        value: col.colType === "string" ? cleanString(d) : d,
      }));

      // if less than 10 options or is a date column, add a "Select all option"
      if (obj[colName].length <= 10 || col.colType === "date") {
        // add a "Select all option"
        obj[colName].unshift({
          label: "Select All",
          value: "select-all",
        });
      }
      return obj;
    }, {})
  );

  // Dropdowns:
  // X Axis: multi select. Only categorical + date columns.
  // Y Axis: multi select. Only quantitative columns.
  // Other dropdowns based on the X axis selection. Using categorical columns opts above.

  const [xAxis, setXAxis] = useState(
    arrToAntD([dateColumn ? dateColumn : xAxisColumns[0]])[0]
  );

  const [yAxis, setYAxis] = useState(arrToAntD([yAxisColumns[0]]));

  const [selectedXValues, setSelectedXValues] = useState({
    [xAxisColumns[0].key]: arrToAntD(
      [xAxisColumnValues[xAxisColumns[0].key][0]],
      null,
      null
    ),
  });

  // chart data
  const [chartConfig, setChartConfig] = useState(nullChartConfig);

  const xAxisDropdown = (
    <div className="chart-container-select">
      <h4>X Axis</h4>
      <Select
        mode="single"
        options={arrToAntD(xAxisColumns)}
        value={xAxis}
        placeholder="Select X Axis"
        onChange={(_, sel) => {
          setSelectedXValues({
            [sel.label]: arrToAntD(
              [xAxisColumnValues[sel.label][0]],
              null,
              null
            ),
          });

          setXAxis(sel);
        }}
      ></Select>
    </div>
  );

  const yAxisDropdown = (
    <div className="chart-container-select">
      <h4>Y Axis</h4>
      <Select
        mode="multiple"
        width
        options={arrToAntD(yAxisColumns)}
        defaultValue={yAxis}
        onChange={(_, sel) => {
          setYAxis(sel);
        }}
        placeholder="Select Y Axis"
      ></Select>
    </div>
  );

  // create dropdowns for selected column(s) for the x axis
  const optValues = opts.current[xAxis.label];

  const xAxisValuesDropdown = (
    // key force rerender when we change selectall->deselctall or vice versa
    <div key={optValues[0].label} className="chart-container-select">
      <h4>{xAxis.label}</h4>
      <Select
        mode="multiple"
        options={optValues}
        defaultValue={selectedXValues[xAxis.label]}
        value={selectedXValues[xAxis.label]}
        placeholder={`Select ${xAxis.label} to plot`}
        // allow select all
        showSearch={true}
        onChange={(_, sel) => {
          const newVals = {};
          // if select all is selected, select all options
          if (sel.findIndex((d) => d.value === "select-all") !== -1) {
            // add all options for this column
            newVals[xAxis.label] = { label: "All", value: "all-selected" };
            // change "select all" to "deselect all"
            optValues[0].label = "Deselect All";
            optValues[0].value = "deselect-all";
          }
          // handle deselect all
          else if (sel.findIndex((d) => d.value === "deselect-all") !== -1) {
            // remove all options for this column
            newVals[xAxis.label] = [];
            // change "deselect all" to "select all"
            optValues[0].label = "Select All";
            optValues[0].value = "select-all";
          } else {
            // change "deselect all" to "select all"
            optValues[0].label = "Select All";
            optValues[0].value = "select-all";
            // The temporary "all" option created above shows up as an empty object in the selected values
            // so we filter it out
            newVals[xAxis.label] = sel.filter(
              (d) => !isEmpty(d) && d.value !== "all-selected"
            );
          }

          setSelectedXValues(Object.assign({}, selectedXValues, newVals));
        }}
      ></Select>
    </div>
  );

  const chartTypes = arrToAntD(
    ["Bar Chart", "Pie Chart", "Line Chart"],
    null,
    null
  );
  const [chartType, setChartType] = useState(chartTypes[0]);

  const chartTypeDropdown = (
    <div className="chart-container-select">
      <h4>Chart Type</h4>
      <Select
        mode="single"
        options={chartTypes}
        value={chartType}
        onChange={(_, sel) => {
          setChartType(sel);
        }}
      ></Select>
    </div>
  );

  const xAxisIsDate = xAxis.__data__.colType === "date";

  let chart = null;
  const chartProps = {
    chartConfig,
    title,
    xAxisIsDate,
    height: 400,
  };

  switch (chartType.label) {
    case "Bar Chart":
      chart = <ColumnChart {...chartProps} />;
      break;
    case "Pie Chart":
      chart = <PieChart {...chartProps} />;
      break;
    case "Line Chart":
    default:
      chart = <TrendChartNew {...chartProps} />;
      break;
  }

  // change chart data
  useEffect(() => {
    if (!xAxis || !yAxis.length || !selectedXValues[xAxis.label].length) {
      setChartConfig(nullChartConfig);
    }

    setChartConfig(
      createChartConfig(
        data,
        xAxis,
        yAxis,
        selectedXValues[xAxis.label].value === "all-selected"
          ? optValues.slice(1)
          : selectedXValues[xAxis.label],
        xAxisIsDate
      )
    );
  }, [selectedXValues, xAxis, yAxis]);

  return (
    <ChartContainerWrap theme={theme}>
      <div className="chart-container">
        {!xAxisColumns.length || !yAxisColumns.length ? (
          <div className="chart-error">
            <span>
              There seem to be no plottable columns in your data. Is this a
              mistake? Please contact us!
            </span>
          </div>
        ) : (
          <div className="chart-container-controls">
            {xAxisDropdown}
            {yAxisDropdown}
            {xAxisValuesDropdown}
            {chartTypeDropdown}
          </div>
        )}

        {xAxisColumns.length &&
        yAxisColumns.length &&
        xAxis &&
        yAxis.length &&
        chartConfig.chartData.length &&
        selectedXValues[xAxis.label].length ? (
          <div className="chart">{chart}</div>
        ) : !xAxis || !yAxis.length ? (
          <div className="chart-error">
            <span>Select both X and Y axis to plot</span>
          </div>
        ) : (
          <div className="chart-error">
            <span>No data to plot</span>
          </div>
        )}
      </div>
    </ChartContainerWrap>
  );
}

const ChartContainerWrap = styled.div`
  .chart-container {
    .chart-container-controls {
      display: flex;
      .chart-container-select {
        margin: 10px 15px;
        width: 300px;
        .ant-select {
          width: 100%;
        }
        h4 {
          margin-bottom: 2px;
        }
      }
    }
    .chart-error {
      width: 100%;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      span {
        color: ${(props) =>
          props.theme ? props.theme.secondaryText : "#606060"};
      }
    }
  }
`;

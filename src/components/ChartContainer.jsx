import { Select } from "antd";
import React, { useEffect, useState, Fragment, useRef } from "react";
import {
  cleanString,
  createChartData,
  isEmpty,
  transformToChartJSType,
} from "./common/utils";
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

export default function ChartContainer({
  xAxisColumns,
  dateColumn,
  yAxisColumns,
  xAxisColumnValues,
  vizType,
  data,
  title,
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
  const [chartData, setChartData] = useState([]);

  const xAxisDropdown = (
    <div className="chart-container-select">
      <h4>X Axis</h4>
      <Select
        mode="single"
        options={arrToAntD(xAxisColumns)}
        value={xAxis}
        placeholder="Select X Axis"
        onChange={(_, sel) => {
          console.log(sel);
          return;

          // initialise (or re-initialise) any newly selected column with the first value
          // this refreshes the values for columns which were earlier selected and then removed and not being selected again
          const newCols = sel
            .filter((col) => !selectedXValues[col.value])
            .reduce((obj, col) => {
              obj[col.value] = arrToAntD(
                [xAxisColumnValues[col.value][0]],
                null,
                null
              );
              return obj;
            }, {});

          // in case a column is deselected,
          // only keep columns still in the selection + in selectedXValues
          const keepCols = Object.keys(selectedXValues)
            // return those in selection + in selectedXValues
            .filter((col) => sel.filter((d) => d.value === col).length === 1)
            .reduce((obj, col) => {
              obj[col] = selectedXValues[col];
              return obj;
            }, {});

          if (newCols.length !== 0) {
            setSelectedXValues(Object.assign({}, keepCols, newCols));
          }

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
  const optValues = opts.current[xAxis.value];

  const xAxisValuesDropdown = (
    // key force rerender when we change selectall->deselctall or vice versa
    <div key={optValues[0].label} className="chart-container-select">
      <h4>{xAxis.label}</h4>
      <Select
        mode="multiple"
        options={optValues}
        defaultValue={selectedXValues[xAxis.value]}
        value={selectedXValues[xAxis.value]}
        placeholder={`Select ${xAxis.value} to plot`}
        // allow select all
        showSearch={true}
        onChange={(_, sel) => {
          const newVals = {};
          // if select all is selected, select all options
          if (sel.findIndex((d) => d.value === "select-all") !== -1) {
            // add all options for this column
            newVals[xAxis.value] = { label: "All", value: "all-selected" };
            // change "select all" to "deselect all"
            optValues[0].label = "Deselect All";
            optValues[0].value = "deselect-all";
          }
          // handle deselect all
          else if (sel.findIndex((d) => d.value === "deselect-all") !== -1) {
            // remove all options for this column
            newVals[xAxis.value] = [];
            // change "deselect all" to "select all"
            optValues[0].label = "Select All";
            optValues[0].value = "select-all";
          } else {
            // change "deselect all" to "select all"
            optValues[0].label = "Select All";
            optValues[0].value = "select-all";
            // The temporary "all" option created above shows up as an empty object in the selected values
            // so we filter it out
            newVals[xAxis.value] = sel.filter(
              (d) => !isEmpty(d) && d.value !== "all-selected"
            );
          }

          setSelectedXValues(Object.assign({}, selectedXValues, newVals));
        }}
      ></Select>
    </div>
  );

  // change chart data
  useEffect(() => {
    if (!xAxis || !yAxis.length || !selectedXValues.length) {
      setChartData([]);
    }

    setChartData(
      createChartData(
        data,
        xAxis,
        yAxis,
        selectedXValues,
        xAxis.__data__.colType === "date"
      )
    );
  }, [selectedXValues, xAxis, yAxis]);

  return (
    <ChartContainerWrap>
      <div className="chart-container">
        <div className="chart-container-controls">
          {xAxisDropdown}
          {yAxisDropdown}
          {xAxisValuesDropdown}
        </div>
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
  }
`;

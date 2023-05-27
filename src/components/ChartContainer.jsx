import { Select } from "antd";
import React, { useEffect, useState, Fragment, useRef } from "react";
import { cleanString, transformToChartJSType } from "./common/utils";
import PieChart from "./Charts/PieChart";
import ColumnChart from "./Charts/ColumnChart";
import TrendChartNew from "./Charts/TrendChartNew";

function arrToAntD(arr, labelProp = "key", valueProp = "key") {
  return arr.map((d) => ({
    label: labelProp ? d[labelProp] : d,
    value: valueProp ? d[valueProp] : d,
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
    arrToAntD([dateColumn ? dateColumn : xAxisColumns[0]])
  );

  const [yAxis, setYAxis] = useState(arrToAntD([yAxisColumns[0]]));

  const [selectedXValues, setSelectedXValues] = useState({
    [xAxisColumns[0].key]: arrToAntD(
      [xAxisColumnValues[xAxisColumns[0].key][0]],
      null,
      null
    ),
  });

  const xAxisDropdown = (
    <div className="chart-container-select">
      <h4>X Axis</h4>
      <Select
        mode="multiple"
        options={arrToAntD(xAxisColumns)}
        defaultValue={xAxis}
        placeholder="Select X Axis"
        onChange={(_, sel) => {
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
  const selectedXAxisDropdowns = xAxis.map((opt) => {
    const optValues = opts.current[opt.value];

    return (
      // key force rerender when we change selectall->deselctall or vice versa
      <div key={optValues[0].label} className="chart-container-select">
        <h4>{opt.label}</h4>
        <Select
          mode="multiple"
          options={optValues}
          defaultValue={selectedXValues[opt.value]}
          value={selectedXValues[opt.value]}
          placeholder="Select Values to plot"
          // allow select all
          showSearch={true}
          onChange={(_, sel) => {
            const newVals = {};
            // if select all is selected, select all options
            if (sel.findIndex((d) => d.value === "select-all") !== -1) {
              // add all options for this column
              newVals[opt.value] = optValues.slice(1);
              // change "select all" to "deselect all"
              optValues[0].label = "Deselect All";
              optValues[0].value = "deselect-all";
            }
            // handle deselect all
            else if (sel.findIndex((d) => d.value === "deselect-all") !== -1) {
              // remove all options for this column
              newVals[opt.value] = [];
              // change "deselect all" to "select all"
              optValues[0].label = "Select All";
              optValues[0].value = "select-all";
            } else {
              // change "deselect all" to "select all"
              optValues[0].label = "Select All";
              optValues[0].value = "select-all";
              newVals[opt.value] = sel;
            }

            setSelectedXValues(Object.assign({}, selectedXValues, newVals));
          }}
        ></Select>
      </div>
    );
  });

  // useEffect(() => {
  //   console.log(xAxis);
  //   console.log(yAxis);
  //   console.log(selectedXValues);
  // });

  return (
    <div className="chart-container">
      <div className="chart-container-controls">
        {xAxisDropdown}
        {yAxisDropdown}
        {selectedXAxisDropdowns}
      </div>
    </div>
  );
}

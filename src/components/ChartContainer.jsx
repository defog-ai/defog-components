import React, { useEffect, useState, useRef, Fragment } from "react";
import {
  cleanString,
  createChartConfig,
  getColValues,
  isEmpty,
} from "./common/utils";
import PieChart from "./Charts/PieChart";
import ColumnChart from "./Charts/ColumnChart";
import TrendChart from "./Charts/TrendChart";
import { styled } from "styled-components";

function arrToAntD(arr, labelProp = "key", valueProp = "key") {
  return arr.map((d) => ({
    label: labelProp ? d?.[labelProp] : d,
    value: valueProp ? d?.[valueProp] : d,
    __data__: d,
  }));
}

const nullChartConfig = { chartLabels: [], chartData: [] };
const sizeThresh = 1024;

export default function ChartContainer({
  xAxisColumns,
  dateColumns,
  yAxisColumns,
  xAxisColumnValues,
  data,
  title,
  vizType,
  theme,
  recommendedXAxisColumns,
  recommendedYAxisColumns,
}) {
  function createColumnValueOpts(col) {
    const colName = col.key;
    if (!xAxisColumnValues[colName]) {
      return [];
    }

    const opts = xAxisColumnValues[colName].map((d) => ({
      label: d,
      value: col.colType === "string" ? cleanString(d) : d,
    }));

    // add a "Select all option"
    // we will default to all selected if length is below threshols
    opts.unshift({
      label: opts.length > sizeThresh ? "Select All" : "Deselect-all",
      value: opts.length > sizeThresh ? "select-all" : "deselect-all",
    });
    return opts;
  }

  // convert x axis column values to antd's select options
  const xAxisOpts = useRef(
    xAxisColumns.reduce((obj, col) => {
      const colName = col.key;
      obj[colName] = createColumnValueOpts(col);
      return obj;
    }, {}),
  );

  // Dropdowns:
  // X Axis: multi select. All columns.
  // Y Axis: multi select. All columns.
  // Other dropdowns based on the X axis selection. Using categorical columns xAxisOpts above.

  const [xAxis, setXAxis] = useState(
    arrToAntD(
      recommendedXAxisColumns.length > 0
        ? xAxisColumns.filter((d) => recommendedXAxisColumns.includes(d.key))
        : [dateColumns.length > 0 ? dateColumns[0] : xAxisColumns[0]],
    ),
  );

  let initialYAxisColumns = [];
  // if there's only one column or the columns are all non numeric
  if (
    yAxisColumns.length === 1 ||
    yAxisColumns.every((d) => d.variableType !== "quantitative")
  ) {
    initialYAxisColumns = yAxisColumns;
  } else if (recommendedYAxisColumns.length > 0) {
    initialYAxisColumns = yAxisColumns.filter((d) =>
      recommendedYAxisColumns.includes(d.key),
    );
  } else {
    try {
      // group the y axis columns into those with means within order of magnitude
      const quantColumns = yAxisColumns.filter(
        (d) => d.variableType === "quantitative" && Object.hasOwn(d, "mean"),
      );

      const means = quantColumns.map((d) => d.mean);
      means.sort();
      const groups = [];
      const alreadyGrouped = [];
      for (let i = 0; i < means.length; i++) {
        if (alreadyGrouped.includes(i)) {
          continue;
        }
        alreadyGrouped.push(i);
        const thisCol = quantColumns[i];
        let group = [thisCol];
        const thisMean = Math.abs(thisCol.mean);

        for (let j = i + 1; j < means.length; j++) {
          if (alreadyGrouped.includes(j)) {
            continue;
          }
          const thatCol = quantColumns[j];
          const thatMean = Math.abs(thatCol.mean);
          const larger = thisMean > thatMean ? thisMean : thatMean;
          const smaller = thisMean < thatMean ? thisMean : thatMean;
          if (larger / smaller < 10) {
            group.push(thatCol);
            alreadyGrouped.push(j);
          }
        }

        groups.push(group);
      }

      // calculate the mean of each group
      const groupMeans = groups.map(
        (group) => group.reduce((acc, d) => acc + d.mean, 0) / group.length,
      );

      // find the group with the largest mean
      const largestGroup = groups[groupMeans.indexOf(Math.max(...groupMeans))];

      // sort the largestGroup array by mean, so that the largest mean is first
      largestGroup.sort((a, b) => b.mean - a.mean);

      initialYAxisColumns = largestGroup;
    } catch (err) {
      console.log(err);
      initialYAxisColumns = yAxisColumns.slice();
    }
  }

  const [yAxis, setYAxis] = useState(
    arrToAntD(
      initialYAxisColumns.length > 1
        ? initialYAxisColumns.filter((d) => d.key !== "index")
        : initialYAxisColumns,
    ),
  );

  const xAxisLabel = !xAxis.length
    ? undefined
    : xAxis.map((d) => d.label).join("-");
  // create dropdowns for selected column(s) for the x axis
  const xAxisOptValues = !xAxisLabel ? [] : xAxisOpts.current[xAxisLabel];

  const [selectedXValues, setSelectedXValues] = useState(
    !xAxisLabel
      ? {}
      : {
          [xAxisLabel]:
            xAxisColumnValues[xAxisLabel]?.length > sizeThresh
              ? [xAxisOpts.current[xAxisLabel]?.[1]]
              : xAxisOpts.current[xAxisLabel]?.length === 0
              ? []
              : [{ label: "All", value: "all-selected" }],
        },
  );

  // chart data
  const [chartConfig, setChartConfig] = useState(nullChartConfig);

  const xAxisDropdown = (
    <div className="chart-container-select">
      <h4>X Axis</h4>
      <select
        multiple
        className="bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={xAxis.map(x => x.value)}
        onChange={e => {
          const selectedOptions = Array.from(e.target.options).filter(option => option.selected).map(option => ({ label: option.label, value: option.value }));
          setXAxis(selectedOptions);
        }}
      >
        {xAxisColumns.map(col => (
          <option key={col.key} value={col.key}>{col.label}</option>
        ))}
      </select>
    </div>
  );

  const yAxisDropdown = (
    <div className="chart-container-select">
      <h4>Y Axis</h4>
      <select
        multiple
        className="bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={yAxis.map(y => y.value)}
        onChange={e => {
          const selectedOptions = Array.from(e.target.options).filter(option => option.selected).map(option => ({ label: option.label, value: option.value }));
          setYAxis(selectedOptions);
        }}
        placeholder="Select Y Axis"
      >
        {yAxisColumns.map(col => (
          <option key={col.key} value={col.key}>{col.label}</option>
        ))}
      </select>
    </div>
  );

  const xAxisValuesDropdown =
    xAxisLabel === "" || !xAxisLabel ? (
      <></>
    ) : (
      // key force rerender when we change selectall->deselctall or vice versa
      <div key={xAxisOptValues?.[0]?.label} className="chart-container-select">
        <h4>{xAxisLabel}</h4>
        <select
          multiple
          className="bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={selectedXValues[xAxisLabel].map(x => x.value)}
          onChange={e => {
            const selectedOptions = Array.from(e.target.options).filter(option => option.selected).map(option => ({ label: option.label, value: option.value }));
            setSelectedXValues({ ...selectedXValues, [xAxisLabel]: selectedOptions });
          }}
          placeholder={`Select ${xAxisLabel} to plot`}
        >
          {xAxisOptValues.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );

  const chartTypes = [
    { label: "Bar Chart", value: "Bar Chart" },
    { label: "Pie Chart", value: "Pie Chart" },
    { label: "Line Chart", value: "Line Chart" },
  ];

  const [chartType, setChartType] = useState({
    label: vizType,
    value: vizType,
    __data__: vizType,
  });

  const chartTypeDropdown = (
    <div className="chart-container-select">
      <h4>Chart Type</h4>
      <select
        className="bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        value={chartType.value}
        onChange={e => {
          const selectedOption = { label: e.target.value, value: e.target.value, __data__: e.target.value };
          setChartType(selectedOption);
        }}
      >
        {chartTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
    </div>
  );

  const xAxisIsDate =
    xAxis.length === 1 && xAxis[0].__data__?.colType === "date";

  let chart = null;
  const chartProps = {
    chartConfig,
    title,
    xAxisIsDate,
    height: 400,
    theme,
  };

  switch (chartType.label) {
    case "Bar Chart":
      chart = (
        <ColumnChart
          // provide key otherwise chartjs defaults won't refresh
          key={title + xAxisIsDate}
          {...chartProps}
        />
      );
      break;
    case "Pie Chart":
      chart = <PieChart key={title + xAxisIsDate} {...chartProps} />;
      break;
    case "Line Chart":
    default:
      chart = <TrendChart key={title + xAxisIsDate} {...chartProps} />;
      break;
  }

  // change chart data
  useEffect(() => {
    if (
      !xAxis.length ||
      !yAxis.length ||
      !selectedXValues[xAxisLabel]?.length
    ) {
      setChartConfig(nullChartConfig);
      return;
    }

    setChartConfig(
      createChartConfig(
        data,
        xAxis,
        yAxis,
        selectedXValues[xAxisLabel].findIndex(
          (d) => d.value === "all-selected",
        ) > -1
          ? xAxisOptValues?.slice(1)
          : selectedXValues[xAxisLabel],
        xAxisIsDate,
      ),
    );
  }, [selectedXValues, xAxis, yAxis]);

  const errorMessages = {
    noCols:
      "There seem to be no plottable columns in your data. Is this a mistake? Please contact us!",
    noData: "No data to plot",
    noDataSelected: "Select data to plot.",
    noColsSelected: "Select both X and Y axis to plot.",
  };

  return (
    <ChartContainerWrap theme={theme}>
      <div className="chart-container">
        {!xAxisColumns.length || !yAxisColumns.length || !data.length ? (
          <div className="chart-error">
            <span>
              {!data.length ? errorMessages.noData : errorMessages.noCols}
            </span>
          </div>
        ) : (
          <>
            <div className="chart-container-controls">
              {chartTypeDropdown}
              {xAxisDropdown}
              {yAxisDropdown}
              {xAxisValuesDropdown}
            </div>

            {xAxisColumns.length &&
            yAxisColumns.length &&
            xAxis.length &&
            yAxis.length &&
            chartConfig.chartData?.length &&
            selectedXValues[xAxisLabel]?.length ? (
              <div className="chart">{chart}</div>
            ) : !xAxis.length || !yAxis.length ? (
              <div className="chart-error">
                <span>{errorMessages.noColsSelected}</span>
              </div>
            ) : (
              <div className="chart-error">
                <span>{errorMessages.noDataSelected}</span>
              </div>
            )}
          </>
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
          color: ${(props) =>
            props.theme ? props.theme.primaryText : "#606060"};
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

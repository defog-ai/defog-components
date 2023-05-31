import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { chartColors } from "../../context/ThemeContext";

dayjs.extend(customParseFormat);

const dateFormats = ["YYYY-MM", "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD HH:mm:ss"];

export function isDate(s) {
  return dayjs(s, dateFormats, true).isValid();
  // return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/gi.test(s);
}

export function cleanString(s) {
  let res = String(s);
  return res.toLowerCase().replace(/ /gi, "-");
}

// change float cols with decimals to 2 decimal places
export function roundColumns(data, columns) {
  const decimalCols = columns
    .filter((d) => d.colType === "decimal")
    .map((d) => d.key);

  // create new data by copying it deeply because in the future we might have tabs for a chart and want to plot accurate vals in charts.
  const roundedData = [];
  data?.forEach((d, i) => {
    roundedData.push(Object.assign({}, d));

    decimalCols?.forEach((colName) => {
      // round to two decimals
      roundedData[i][colName] = roundedData[i][colName].toFixed(2);
    });
  });

  return roundedData;
}

// sigh. sometimes model returns numbers as strings for some reason.
// so use regex instead of typeof
// from here: https://stackoverflow.com/questions/2811031/decimal-or-numeric-values-in-regular-expression-validation
function isNumber(val) {
  return /^-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/.test(val);
}

export function inferColumnType(rows, colIdx, colName) {
  // go through rows
  const res = {};
  res["numeric"] = false;
  res["variableType"] = "quantitative";
  if( colName.includes("user") || colName.endsWith("_id") || colName.startsWith("id_") || colName === "id" ) {
    res["colType"] = "string";
    res["variableType"] = "categorical";
    res['numeric'] = false;
    res["simpleTypeOf"] = typeof val;
    return res;
  } else if (colName === "year" || colName === "month") {
    res["colType"] = "date";
    res["variableType"] = "categorical";
    res['numeric'] = false;
    res["simpleTypeOf"] = typeof val;
    return res;
  } else {
    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][colIdx];
      if (val === null) continue;
      else if (isDate(val)) {
        res["colType"] = "date";
        res["variableType"] = "categorical";
        res['numeric'] = false;
      }
      // is a number and also has a decimal
      else if (isNumber(val) && val.toString().indexOf(".") >= 0) {
        res["colType"] = "decimal";
        res["numeric"] = true;
        res["variableType"] = "quantitative";
      }
      // if number but no decimal
      else if (isNumber(val)) {
        res["colType"] = "integer";
        res["numeric"] = true;
        res["variableType"] = "quantitative";
      } else {
        res["colType"] = typeof val;
        res["numeric"] = res["colType"] === "number";
        res["variableType"] =
          res["colType"] === "number" ? "quantitative" : "categorical";
      }
  
      res["simpleTypeOf"] = typeof val;
      return res;
    }
  }
}

function formatTime(val) {
  return dayjs(val, [...dateFormats, ["YYYY", "MM", "MMM", "M", "MMMM"]]).format("D MMM 'YY");
}

export function setChartJSDefaults(
  ChartJSRef,
  title = "",
  xAxisIsDate = false,
  theme,
  pieChart = false
) {
  ChartJSRef.defaults.scale.grid.drawOnChartArea = false;
  ChartJSRef.defaults.interaction.axis = "x";
  ChartJSRef.defaults.interaction.mode = "nearest";
  ChartJSRef.defaults.maintainAspectRatio = false;
  ChartJSRef.defaults.plugins.title.display = true;
  // pie charts can be multiple, so we don't want to show the overall title aka query
  // we want to show each column's title above each pie chart instead (this is done in the component itself)
  if (!pieChart) {
    ChartJSRef.defaults.plugins.title.text = title;
  }

  // tooltip background clor white
  ChartJSRef.defaults.plugins.tooltip.backgroundColor = "white";
  // title and label color is chartcolors primary color
  ChartJSRef.defaults.plugins.tooltip.titleColor = "#0D0D0D";
  ChartJSRef.defaults.plugins.tooltip.bodyColor = "#0D0D0D";
  // border color is defog blue
  ChartJSRef.defaults.plugins.tooltip.borderColor = "#2B59FF";
  ChartJSRef.defaults.plugins.tooltip.borderWidth = 1;
  ChartJSRef.defaults.plugins.tooltip.padding = 10;

  ChartJSRef.defaults.plugins.title.color = theme.primaryText;

  // if x axis is a date, add a d3 formatter
  if (xAxisIsDate) {
    ChartJSRef.defaults.plugins.tooltip.displayColors = false;

    ChartJSRef.defaults.plugins.tooltip.callbacks.title = function (
      tooltipItems
    ) {
      return tooltipItems.map((item) => formatTime(item.label));
    };
    ChartJSRef.defaults.plugins.tooltip.callbacks.label = function (
      tooltipItem
    ) {
      return tooltipItem.dataset.label + ": " + tooltipItem.formattedValue;
    };

    ChartJSRef.defaults.scales.category.ticks = {
      callback: function (value) {
        return formatTime(this.getLabelForValue(value));
      },
    };

    if (pieChart) {
      // legend labels are also dates
      // pie/doughnuts charts are weird in chartjs
      // brilliant hack to edit some props of legendItems without having to remake them from here: https://stackoverflow.com/questions/39454586/pie-chart-legend-chart-js
      ChartJSRef.overrides.pie.plugins.legend.labels.filter = function (
        legendItem
      ) {
        legendItem.text = formatTime(legendItem.text);
        return true;
      };
    }
  }
}

export const mapToObject = (
  map = new Map(),
  parentNestLocation = [],
  processValue = (d) => d,
  // hook will allow you to do extra computation on every recursive call to this function
  hook = () => {}
) =>
  Object.fromEntries(
    Array.from(map.entries(), ([key, value]) => {
      // also store nestLocation for all of the deepest children
      value.nestLocation = parentNestLocation.slice();
      value.nestLocation.push(key);
      hook(key, value);

      return value instanceof Map
        ? [key, mapToObject(value, value.nestLocation, processValue)]
        : [key, processValue(value)];
    })
  );

export function processData(data, columns) {
  // find if there's a date column
  const dateColumns = columns.filter((d) => d.colType === "date");
  // date comes in as categorical column, but we use that for the x axis, so filter that out also
  const categoricalColumns = columns.filter(
    (d) => d.variableType[0] === "c" && d.colType !== "date"
  );

  // y axis columns are the remaining columns:
  const yAxisColumns = columns.filter(
    (d) => d.variableType[0] !== "c" && d.colType !== "date"
  );

  const xAxisColumns =
    dateColumns.length > 0
      ? categoricalColumns.concat(dateColumns)
      : categoricalColumns;

  // find unique values for each of the x axis columns for the dropdowns
  // this we'll use for "labels" prop for chartjs
  const xAxisColumnValues = {};
  xAxisColumns.forEach((c) => {
    xAxisColumnValues[c.key] = new Set();
    data?.forEach((d) => {
      xAxisColumnValues[c.key].add(d[c.key]);
    });
    xAxisColumnValues[c.key] = Array.from(xAxisColumnValues[c.key]);
  });

  return {
    xAxisColumns,
    categoricalColumns,
    yAxisColumns,
    dateColumns,
    xAxisColumnValues,
  };
}

export function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

export function createChartConfig(
  data,
  xAxisColumn,
  yAxisColumns,
  selectedXValues,
  xAxisIsDate
) {
  // chart labels are just selectedXValues
  const chartLabels = selectedXValues?.map((d) => d.label);

  // go through data and find data points for which the xAxisColumn value exists in chartLabels
  let filteredData = data.filter((d) => {
    return chartLabels?.includes(d[xAxisColumn?.label]);
  });

  // groupby xAxisColumn value and the sum of the yAxisColumns
  // this is the data that will be used for the chart
  // don't use d3 while doing this, since d3 is not imported in this file
  // use native js instead
  filteredData = filteredData.reduce((acc, curr) => {
    const key = curr[xAxisColumn.label];
    if (!acc[key]) {
      acc[key] = {};
      yAxisColumns.forEach((col) => {
        acc[key][col.label] = 0;
      });
    }
    yAxisColumns.forEach((col) => {
      acc[key][col.label] += curr[col.label];
    });
    return acc;
  }, {});

  // if x axis is not date,
  // sort labels and fitleredData by the first yAxisColumn
  if (!xAxisIsDate) {
    chartLabels?.sort(
      (a, b) =>
        filteredData[b][yAxisColumns[0].label] -
        filteredData[a][yAxisColumns[0].label]
    );
  }

  // convert filteredData to an array of objects
  // this is the format that chartjs expects
  filteredData = Object.entries(filteredData).map(([key, value]) => {
    const obj = { [xAxisColumn.label]: key };
    yAxisColumns.forEach((col) => {
      obj[col.label] = value[col.label];
    });
    return obj;
  });

  // use chartjs parsing to create chartData
  // for each yAxisColumn, there is a chartjs "dataset"
  const chartData = yAxisColumns?.map((col, i) => ({
    label: col.label,
    data: filteredData,
    backgroundColor: chartColors[i % chartColors.length],
    parsing: {
      xAxisKey: xAxisColumn.label,
      yAxisKey: col.label,
      // for pie charts
      key: col.label,
    },
  }));
  return { chartData, chartLabels };
}

export function transformToCSV(rows, columnNames) {
  const header = '"' + columnNames.join('","') + '"\n';
  const body = rows.map((d) => '"' + d.join('","') + '"').join("\n");
  return header + body;
}

// https://stackoverflow.com/questions/24898044/is-possible-to-save-javascript-variable-as-file
export function download_csv(csvString) {
  var hiddenElement = document.createElement("a");

  hiddenElement.href = "data:attachment/text," + encodeURI(csvString);
  hiddenElement.target = "_blank";
  hiddenElement.download = `data-${new Date().toISOString().slice(0, -5)}.csv`;
  hiddenElement.click();
  hiddenElement.remove();
}

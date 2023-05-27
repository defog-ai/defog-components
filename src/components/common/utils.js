// a very, VERY simple checker to cehck if a value is a date.
// if we need something more complex in the future, perhaps using dayjs would be a better option

import { group } from "d3-array";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const dateFormats = ["YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss"];

export function isDate(s) {
  return dayjs(s, dateFormats, true).isValid();
  // return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/gi.test(s);
}

export function cleanString(s) {
  return s.toLowerCase().replace(/ /gi, "-");
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

export function inferColumnType(rows, colIdx) {
  // go through rows
  const res = {};
  res["numeric"] = false;

  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][colIdx];
    if (val === null) continue;
    else if (isDate(val)) {
      res["colType"] = "date";
    }
    // is a number and also has a decimal
    else if (isNumber(val) && val.toString().indexOf(".") >= 0) {
      res["colType"] = "decimal";
      res["numeric"] = true;
    }
    // if number but no decimal
    else if (isNumber(val)) {
      res["colType"] = "integer";
      res["numeric"] = true;
    } else {
      res["colType"] = typeof val;
      res["numeric"] = res["colType"] === "number";
    }

    res["simpleTypeOf"] = typeof val;

    return res;
  }
}

function formatTime(val) {
  return dayjs(val).format("D MMM 'YY");
}

export function setChartJSDefaults(
  ChartJSRef,
  title = "",
  xAxisIsDate = false
) {
  ChartJSRef.defaults.scale.grid.drawOnChartArea = false;
  ChartJSRef.defaults.interaction.axis = "x";
  ChartJSRef.defaults.interaction.mode = "nearest";
  ChartJSRef.defaults.maintainAspectRatio = false;
  ChartJSRef.defaults.plugins.title.display = true;
  ChartJSRef.defaults.plugins.title.text = title;

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
      return tooltipItem.formattedValue;
    };

    ChartJSRef.defaults.scales.category.ticks = {
      callback: function (value) {
        return formatTime(this.getLabelForValue(value));
      },
    };
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
  const dateColumn = columns.find((d) => d.colType === "date");
  let xAxisColumn;
  if (dateColumn !== undefined) {
    xAxisColumn = dateColumn;
  } else {
    // use first column
    xAxisColumn = columns[0];
  }

  // date comes in as categorical column, but we use that for the x axis, so filter that out also
  const categoricalColumns = columns.filter(
    (d) => d.variableType[0] === "c" && d.colType !== "date"
  );

  // y axis columns are the remaining columns:
  const yAxisColumns = columns.filter(
    (d) => d.variableType[0] !== "c" && d.colType !== "date"
  );

  const xAxisColumns = dateColumn
    ? categoricalColumns.concat(dateColumn)
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
    dateColumn,
    xAxisColumnValues,
  };
}

export function transformToChartJSType(
  data,
  xAxisColumn,
  yAxisColumns,
  categoricalColumns,
  xAxisIsDate
) {
  // a helper function to get values of the xAxisColumn later
  // valueOf is to get the value of a dayjs object
  const xAxisColVal = xAxisIsDate ? (d) => d.valueOf() : (d) => d;

  let xAxisLabels = new Set();

  data?.forEach((d) => {
    xAxisLabels.add(d[xAxisColumn.key]);
  });

  xAxisLabels = Array.from(xAxisLabels);

  // sort x axis
  if (xAxisIsDate) {
    xAxisLabels = xAxisLabels.map((d) => dayjs(d, dateFormats));
  } else {
    xAxisLabels.sort();
  }

  const chartData = yAxisColumns.map((d) => {
    const x = [];
    x.title = d.key;
    return x;
  });

  data?.forEach((d) => {
    for (let i = 0; i < yAxisColumns.length; i++) {
      chartData[i].push(d[yAxisColumns[i].key]);
    }
  });

  return { chartLabels: xAxisLabels, chartData: chartData };

  if (false) {
    // uhh, ignore for now
    /* chartData has the y values.
    this can be multiple lines being plotted simultaneously.
    Example:
    data: {
              columns:  ['sale_date', 'username', 'avg_price_paid', 'avg_commission']
              data: [
                      ['2008-01-01', 'ABC', 1060.44, 159.06],
                      ['2008-01-02', 'DEF',  665.6, 99.84],
                      ....
                    ]
          ...
    }
   */

    /* once we set the x axis, each categorical column for example username above is its own bar/line/etc
    // each non date, non categorical, non boolean (hence purely number) column is the y axis.
    // we need to group the data by all of the categorical columns
    // and generate different datasets for each.
    // d3.group by all categorical variables
    */

    // create chart data from

    // nest data for each of the above categorical columns
    // ref: https://stackoverflow.com/questions/57611237/javascript-convert-nested-map-to-object
    // ref: https://observablehq.com/@severo/til-d3-group-with-arbitrary-keys
    const keys = categoricalColumns.map((col) => (d) => d[col.key]);

    let chartData = [];
    if (keys.length > 0) {
      mapToObject(group(data, ...keys), [], (_d) => {
        let d = _d.slice();
        d.title = _d.nestLocation.join("-");

        // if there was a date column, convert date strings to objects, and also sort by date column
        if (xAxisIsDate) {
          d.forEach((o) => {
            o[xAxisColumn.key] = dayjs(o[xAxisColumn.key], dateFormats);
          });

          d.sort(
            (a, b) =>
              xAxisColVal(a[xAxisColumn.key]) - xAxisColVal(b[xAxisColumn.key])
          );
        }
        // else just sort
        else {
          d.sort();
        }

        // in this dataset, find the chart labels for which data is missing, and add nulls for that
        let i = 0;
        while (d.length <= xAxisLabels.length) {
          if (
            !d[i] ||
            xAxisColVal(xAxisLabels[i]) !== xAxisColVal(d[i][xAxisColumn.key])
          ) {
            d.splice(i, 0, null);
          }
          i++;
        }

        const yVals = d.map((o) =>
          o === null ? null : o[yAxisColumns[0].key]
        );
        yVals.title = d.title;

        chartData.push(yVals);
      });
    } else {
      // has no categorical columns

      chartData = yAxisColumns.map((d) => {
        const x = [];
        x.title = d.key;
        return x;
      });

      data?.forEach((d) => {
        for (let i = 0; i < yAxisColumns.length; i++) {
          chartData[i].push(d[yAxisColumns[i].key]);
        }
      });
    }
  }
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

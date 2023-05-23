// a very, VERY simple checker to cehck if a value is a date.
// if we need something more complex in the future, perhaps using dayjs would be a better option

import { group } from "d3-array";
import dayjs from "dayjs";

// https://day.js.org/docs/en/parse/is-valid
export function isDate(s) {
  // assuming a format like so: "2008-01-01T00:00:00"
  // YYYY-MM-DDTHH:MM:SS
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/gi.test(s);
}

// change float cols with decimals to 2 decimal places
export function roundColumns(data, columns) {
  const decimalCols = columns
    .filter((d) => d.colType === "decimal")
    .map((d) => d.key);

  // create new data by copying it deeply because in the future we might have tabs for a chart and want to plot accurate vals in charts.
  const roundedData = [];
  data.forEach((d, i) => {
    roundedData.push(Object.assign({}, d));

    decimalCols.forEach((colName) => {
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
  return dayjs(val, "YYYY-MM-DDTHH:MM:SS").format("D MMM 'YY");
}

export function setChartJSDefaults(
  ChartJSRef,
  title = "",
  xAxisIsDate = false
) {
  console.log(xAxisIsDate);
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

export function transformToChartJSType(data, columns) {
  // the first column is the x axis.
  // that goes into "labels" for chartjs options.
  const xAxisCol = columns[0].key;
  const chartLabels = [];

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
    it should contain (columns.length - 1) arrays
   */
  const chartData = columns
    .map((d) => {
      let _ = [];
      _.column = d;
      return _;
    })
    .slice(1);

  /* Notes for a still experimental thing:
  // once we set the x axis, each categorical column for example username above is its own bar/line/etc
  // each non date, non categorical, non boolean (hence purely number) column is the y axis.
  // we need to group the data by all of the categorical columns
  // and generate different datasets for each.
  // d3.group by all categorical variables
  */

  // date comes in as categorical column, but is the x axis, so filter that *out*
  const categoricalColumns = columns.filter(
    (d) => d.variableType[0] === "c" && d.colType !== "date"
  );

  // nest data for each of the above categorical columns
  // ref: https://stackoverflow.com/questions/57611237/javascript-convert-nested-map-to-object
  // ref: https://observablehq.com/@severo/til-d3-group-with-arbitrary-keys
  const keys = categoricalColumns.map((col) => (d) => d[col.key]);

  const nestedData = [];
  mapToObject(group(data, ...keys), [], (d) => nestedData.push(d));
  console.log(nestedData);

  data.forEach((d) => {
    chartLabels.push(d[xAxisCol]);

    for (let i = 1; i < columns.length; i++) {
      chartData[i - 1].push(d[columns[i].key]);
    }
  });
  return { chartLabels, chartData };
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

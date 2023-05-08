// a very, VERY simple checker to cehck if a value is a date.
// if we need something more complex in the future, perhaps using dayjs would be a better option

import dayjs from "dayjs";

// https://day.js.org/docs/en/parse/is-valid
export function isDate(s) {
  // assuming a format like so: "2008-01-01T00:00:00"
  // YYYY-MM-DDTHH:MM:SS
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/gi.test(s);
}

export function inferColumnType(rows, colIdx) {
  // go through rows
  for (let i = 0; i < rows.length; i++) {
    const val = rows[i][colIdx];
    if (val === null) continue;
    else if (isDate(val)) {
      return "date";
    } else {
      return typeof val;
    }
  }
  // if haven't returned yet
  return "undefined";
}

function formatTime(val) {
  return dayjs(val, "YYYY-MM-DDTHH:MM:SS").format("D MMM 'YY");
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

export function transformToChartJSType(data, columns) {
  // the first column is x axis.
  // that goes into "labels" for chartjs options.
  // store it and keep aside at first.
  const chartLabels = [];
  // chartData has the y values.
  // this can be multiple lines being plotted simultaneously.
  // Example:
  // data: {
  //          columns:  ['sale_date', 'username', 'avg_price_paid', 'avg_commission']
  //          data: [
  //                  ['2008-01-01', 'ABC', 1060.44, 159.06],
  //                  ['2008-01-02', 'DEF',  665.6, 99.84],
  //                  ....
  //                 ]
  //       ...
  // }

  // it should contain (columns.length - 1) arrays
  const chartData = columns.map((d) => []).slice(1);

  /* Notes for a still experimental thing:
  // once we set the date axis to be the x axis, each categorical column for example username above is its own bar/line/etc
  // each non date, non categorical, non boolean (hence purely number) column is the y axis.
  // we need to group the data by all of the categorical columns
  */

  data.forEach((d) => {
    chartLabels.push(d[0]);
    for (let i = 1; i < d.length; i++) {
      chartData[i - 1].push(d[i]);
    }
  });
  return { chartLabels, chartData };
}

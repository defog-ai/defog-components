// a very, VERY simple checker to cehck if a value is a date.
// if we need something more complex in the future, perhaps using dayjs would be a better option
// https://day.js.org/docs/en/parse/is-valid
export function isDate(s) {
  // assuming a format like so: "2008-01-01T00:00:00"
  // YYYY-MM-DDTHH:MM:SS
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/gi.test(s);
}

export function setChartJSDefaults(ChartJSRef) {
  ChartJSRef.defaults.scale.grid.drawOnChartArea = false;
  ChartJSRef.defaults.interaction.axis = "xy";
  ChartJSRef.defaults.interaction.mode = "nearest";
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
  //          columns:  ['sale_date', 'avg_price_paid', 'avg_commission']
  //          data: [
  //                  ['2008-01-01', 1060.44, 159.06],
  //                  ['2008-01-02', 665.6, 99.84],
  //                  ....
  //                 ]
  //       ...
  // }

  // it should contain (columns.length - 1) arrays
  const chartData = columns.map((d) => []).slice(1);

  data.forEach((d) => {
    chartLabels.push(d[0]);
    for (let i = 1; i < d.length; i++) {
      chartData[i - 1].push(d[i]);
    }
  });
  return { chartLabels, chartData };
}

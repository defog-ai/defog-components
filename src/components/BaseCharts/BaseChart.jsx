import React from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
if (typeof Highcharts === 'object') {
  require("highcharts/highcharts-more")(Highcharts);
  require("highcharts/modules/treemap")(Highcharts);
  require("highcharts/modules/heatmap")(Highcharts);
  require("highcharts/modules/boost")(Highcharts);
  require("highcharts/modules/exporting")(Highcharts);
  require("highcharts/modules/export-data")(Highcharts);
  require("highcharts/modules/offline-exporting")(Highcharts);
}

const BaseChart = ((props) => {
  try {
    Highcharts.setOptions({
      lang: {
        decimalPoint: ".",
        thousandsSep: ",",
        numericSymbols: ["k", "M", "B", "T", "P", "E"],
      },
      colors: [
        "#4368F7",
        "#7243F7",
        "#E7686E",
        "#EE8351",
        "#F2AA3C",
        "#84C56D",
        "#C5BC6D",
      ],
    });
  } catch (error) {
    console.log(error);
  }
  
  return (
    <HighchartsReact
      className="chart"
      options={props.options}
      highcharts={Highcharts}
      constructorType={props.chartType}
      allowChartUpdate={true}
      immutable={false}
    />
  );
});

BaseChart.displayName = "BaseChart";

export default BaseChart;

import React from "react";
import ErrorBoundary from "../common/ErrorBoundary";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { setChartJSDefaults } from "../common/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendChart = React.memo(
  ({ chartConfig, title, height, xAxisIsDate, theme }) => {
    const { chartLabels, chartData } = chartConfig;
    setChartJSDefaults(ChartJS, title, xAxisIsDate, theme);

    Object.assign(ChartJS.defaults.elements.point, {
      borderWidth: 0,
      radius: 5,
      hitRadius: 10,
      hoverRadius: 5,
    });

    if (chartData instanceof Array) {
      return (
        <ErrorBoundary>
          <div className="flex justify-center">
            <div className="w-full lg:w-1/2">
              <div className="pie-chart-ctr" style={{ height: height + "px" }}>
                <Line
                  data={{
                    labels: chartLabels,
                    datasets: chartData.map((d) => ({
                      ...d,
                      tension: 0.2,
                    })),
                  }}
                ></Line>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      );
    } else {
      return <div></div>;
    }
  },
  () => false
);

TrendChart.displayName = "TrendChart";

export default TrendChart;

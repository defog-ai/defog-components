import React from "react";
import ErrorBoundary from "../common/ErrorBoundary";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { setChartJSDefaults } from "../common/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ColumnChart = React.memo(
  ({ chartConfig, title, height, xAxisIsDate, theme }) => {
    const { chartLabels, chartData } = chartConfig;
    setChartJSDefaults(ChartJS, title, xAxisIsDate, theme);

    return (
      <ErrorBoundary>
        <div className="flex justify-center">
          <div className="w-full lg:w-1/2">
            <div className="column-chart-ctr" style={{ height: height + "px" }}>
              <Bar
                data={{
                  labels: chartLabels,
                  datasets: chartData.map((d) => ({
                    ...d,
                  })),
                }}
              ></Bar>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  },
  () => false
);

ColumnChart.displayName = "ColumnChart";

export default ColumnChart;

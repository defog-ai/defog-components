import React from "react";
// import Chart from "../BaseCharts/Chart.jsx";
import ErrorBoundary from "../common/ErrorBoundary";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

const ColumnChart = React.memo(
  (props) => {
    const chartLabels = [];
    const chartData = [];
    props.data.dataJSON.forEach((d) => {
      chartLabels.push(d.x);
      chartData.push(d.y);
    });

    return (
      <ErrorBoundary>
        <div
          className="column-chart-ctr"
          style={{ height: props.height + "px" }}
        >
          <Bar
            data={{
              labels: chartLabels,
              datasets: [
                {
                  data: chartData,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: props.data.title,
                },
              },
            }}
          ></Bar>
        </div>
      </ErrorBoundary>
    );
  },
  () => false
);

ColumnChart.displayName = "ColumnChart";

export default ColumnChart;

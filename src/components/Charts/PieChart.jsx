import React from "react";
// import Chart from "../BaseCharts/Chart.jsx";
import ErrorBoundary from "../common/ErrorBoundary";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

const PieChart = React.memo(
  (props) => {
    const chartLabels = [];
    const chartData = [];
    props.data.dataJSON.forEach((d) => {
      chartLabels.push(d.name);
      chartData.push(d.y);
    });

    return (
      <ErrorBoundary>
        <div className="pie-chart-ctr" style={{ height: props.height + "px" }}>
          <Pie
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
          ></Pie>
        </div>
      </ErrorBoundary>
    );
  },
  () => false
);

PieChart.displayName = "PieChart";

export default PieChart;

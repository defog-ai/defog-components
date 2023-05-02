import React from "react";
import { Row, Col } from "antd";
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
import { setChartJSDefaults, transformToChartJSType } from "../common/utils";

setChartJSDefaults(ChartJS);

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

const PieChart = React.memo(
  (props) => {
    const { data, columns, title } = props.data;
    const height = props.height;

    const { chartData, chartLabels } = transformToChartJSType(data, columns);

    return (
      <ErrorBoundary>
        <Row justify={"center"}>
          <Col md={{ span: 24 }} lg={12}>
            <div className="pie-chart-ctr" style={{ height: height + "px" }}>
              <Pie
                data={{
                  labels: chartLabels,
                  datasets: chartData.map((d, i) => ({
                    label: columns[i + 1].title,
                    data: d,
                  })),
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: title,
                    },
                  },
                }}
              ></Pie>
            </div>
          </Col>
        </Row>
      </ErrorBoundary>
    );
  },
  () => false
);

PieChart.displayName = "PieChart";

export default PieChart;

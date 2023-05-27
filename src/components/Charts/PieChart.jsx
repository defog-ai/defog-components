import React from "react";
import { Row, Col } from "antd";
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
import { chartColors } from "../../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

const PieChart = React.memo(
  (props) => {
    const { data, columns, title } = props.data;
    const height = props.height;
    setChartJSDefaults(ChartJS, title, columns[0]?.colType === "date");

    const { chartData, chartLabels } = transformToChartJSType(data, columns);

    return (
      <ErrorBoundary>
        <Row justify={"center"}>
          {/* don't nest pie charts */}
          {chartData.map((d, i) => (
            <Col md={{ span: 24 }} lg={12}>
              <div className="pie-chart-ctr" style={{ height: height + "px" }}>
                <Pie
                  key={columns[i + 1].title}
                  data={{
                    labels: chartLabels,
                    datasets: [
                      {
                        label: columns[i + 1].title,
                        data: d,
                        backgroundColor: chartColors,
                        borderWidth: 0,
                      },
                    ],
                  }}
                ></Pie>
              </div>
            </Col>
          ))}
        </Row>
      </ErrorBoundary>
    );
  },
  () => false
);

export default PieChart;

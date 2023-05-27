import React, { useState } from "react";
import { Row, Col } from "antd";
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
import { setChartJSDefaults, transformToChartJSType } from "../common/utils";
import { chartColors } from "../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendChartNew = React.memo(
  ({ chartData, chartLabels, title, height, xAxisIsDate }) => {
    setChartJSDefaults(ChartJS, title, xAxisIsDate);

    Object.assign(ChartJS.defaults.elements.point, {
      borderWidth: 0,
      radius: 5,
      hitRadius: 10,
      hoverRadius: 5,
    });

    if (data instanceof Array) {
      return (
        <ErrorBoundary>
          <Row justify={"center"}>
            <Col md={{ span: 24 }} lg={12}>
              <div className="pie-chart-ctr" style={{ height: height + "px" }}>
                <Line
                  data={{
                    labels: chartLabels,
                    datasets: chartData.map((d, i) => ({
                      label: d.title,
                      data: d,
                      tension: 0.2,
                      backgroundColor: chartColors,
                    })),
                  }}
                ></Line>
              </div>
            </Col>
          </Row>
        </ErrorBoundary>
      );
    } else {
      return <div></div>;
    }
  },
  () => false
);

export default TrendChartNew;

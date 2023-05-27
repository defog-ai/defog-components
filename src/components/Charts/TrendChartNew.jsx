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
  (props) => {
    const { data, columns, title } = props.data;
    const height = props.height;
    setChartJSDefaults(ChartJS, title, columns[0]?.colType === "date");

    Object.assign(ChartJS.defaults.elements.point, {
      borderWidth: 0,
      radius: 5,
      hitRadius: 10,
      hoverRadius: 5,
    });

    if (data instanceof Array) {
      const { chartData, chartLabels } = transformToChartJSType(data, columns);

      // construct config object for chartjs
      const chartJsConfig = {
        data: {
          labels: chartLabels,
          datasets: chartData.map((d, i) => ({
            label: columns[i + 1].title,
            data: d,
            tension: 0.2,
            backgroundColor: chartColors,
          })),
        },
      };

      return (
        <ErrorBoundary>
          <Row justify={"center"}>
            <Col md={{ span: 24 }} lg={12}>
              <div className="pie-chart-ctr" style={{ height: height + "px" }}>
                <Line {...chartJsConfig}></Line>
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

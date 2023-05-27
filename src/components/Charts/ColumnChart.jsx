import React from "react";
import ErrorBoundary from "../common/ErrorBoundary";
import { Row, Col } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  defaults,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { setChartJSDefaults, transformToChartJSType } from "../common/utils";
import { chartColors } from "../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const ColumnChart = React.memo(
  (props) => {
    const { data, columns, title } = props.data;
    const height = props.height;

    setChartJSDefaults(ChartJS, title, columns[0]?.colType === "date");

    const { chartData, chartLabels } = transformToChartJSType(data, columns);
    return (
      <ErrorBoundary>
        <Row justify={"center"}>
          <Col md={{ span: 24 }} lg={12}>
            <div className="column-chart-ctr" style={{ height: height + "px" }}>
              <Bar
                data={{
                  labels: chartLabels,
                  datasets: chartData.map((d, i) => ({
                    label: columns[i + 1].title,
                    data: d,
                    backgroundColor: chartColors,
                  })),
                }}
              ></Bar>
            </div>
          </Col>
        </Row>
      </ErrorBoundary>
    );
  },
  () => false
);

export default ColumnChart;

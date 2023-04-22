import React, { useState } from "react";
import Chart from "../BaseCharts/Chart.jsx";
import { Spin, Row, Col } from "antd";
import ErrorBoundary from "../common/ErrorBoundary";

const ColumnChart = React.memo((props) => {
  const [loading, setLoading] = useState(false);
  const style = props.style || {};
  // console.log(props);

  const options = {
    chart: {
      marginRight: 10,
      backgroundColor: style?.backgroundColor || "#fff",
      animation: false,
      height: style.height || props.height || 420,
      type: "column",
    },
    xAxis: {
      categories: props.data.xAxisCategories,
    },
    yAxis: {
      title: {
        text: props.data.uom,
      },
    },
    title: {
      text: props?.noTitle ? null : props.data?.title,
      align: "left",
      style: {
        fontSize: "19px",
        fontFamily: "Inter",
      },
    },
    plotOptions: {
      series: {
        marker: { enabled: false },
        animation: {
          duration: 0,
        },
      },
      column: {
        negativeColor: "#fc8d59",
      },
    },
    legend: {
      enabled: props.legendEnabled || false,
      itemStyle: { fontWeight: "400" },
    },
    credits: { enabled: false },
    series: [
      {
        name: props.data.seriesName,
        data: props.data.dataJSON,
        colorByPoint: true,
      },
    ],
  };
  return (
    <ErrorBoundary>
      <Row>
        <Col span={24}>
          {loading ? (
            <div style={{ height: props.height || 400 }}>
              <Spin />
            </div>
          ) : (
            <Chart options={options} />
          )}
        </Col>
      </Row>
    </ErrorBoundary>
  );
}, () => false);

ColumnChart.displayName = "ColumnChart";

export default ColumnChart;

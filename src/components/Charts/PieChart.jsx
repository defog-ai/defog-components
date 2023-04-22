import React from "react";
import Chart from "../BaseCharts/Chart.jsx";
import ErrorBoundary from "../common/ErrorBoundary";

const PieChart = React.memo((props) => {
  const seriesData = props.data.seriesName
    ? [
        {
          name: props.data.seriesName,
          data: props.data.dataJSON,
          colorByPoint: true,
        },
      ]
    : [{name: "Data", data: props.data.dataJSON, colorByPoint: true}];
  
  const options = {
    chart: {
      marginRight: 10,
      backgroundColor: props.style?.backgroundColor || "#fff",
      animation: false,
      height: props.height || 400,
      type: "pie",
      plotShadow: false,
    },
    title: {
      text: props?.noTitle ? null : props.data?.title,
      align: "left",
      style: {
        color: props.style?.textColor || undefined,
        fontSize:
          props.data?.title?.length <= 50 || props.standaloneChart ? "14px" : "11px",
        fontFamily: props.style?.titleFont || "Inter",
      },
    },
    plotOptions: {
      series: {
        marker: { enabled: false },
        animation: {
          duration: 0,
        },
        stacking: "normal",
      },
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: '#000000',
            fontSize: '11px',
            fontFamily: 'Inter',
          },
        }
      },
    },
    credits: { enabled: false },
    series: seriesData,
  };

  return (
    <ErrorBoundary>
      <Chart options={options} />
    </ErrorBoundary>
  );
}, () => false);

PieChart.displayName = "PieChart";

export default PieChart;
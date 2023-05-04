import React, { useState } from "react";
import Chart from "../BaseCharts/Chart.jsx";
import { Row, Col } from "antd";
import ErrorBoundary from "../common/ErrorBoundary";

const TrendChart = React.memo(
  (props) => {
    const [data, setData] = useState(props.data);
    // const exportEnabled = props.annotate;

    const convertToMonthsView = (arr) => {
      const vals = [...arr];
      const newVals = {};
      for (const item of vals) {
        const date = new Date(item[0]);
        const dateMonth = new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
        );
        newVals[dateMonth.getTime()] = item[1];
      }
      return newVals;
    };

    const transformData = (dataJSON, transformMode, transformProps) => {
      // assume that transformData is a single array in the [[epochtime, value], ... ] format
      const vals = [...dataJSON];
      if (transformMode === "base") {
        return vals;
      } else if (transformMode === "yoy") {
        const originalData = [...vals];
        const finVals = convertToMonthsView(originalData);
        const yoyChange = {};
        for (const key in finVals) {
          const date = new Date(parseInt(key));
          const yearago = new Date(
            Date.UTC(date.getUTCFullYear() - 1, date.getUTCMonth(), 1)
          );
          const yearagokey = String(yearago.getTime());
          if (yearagokey in finVals) {
            yoyChange[key] =
              (100 * (finVals[key] - finVals[yearagokey])) /
              finVals[yearagokey];
          }
        }
        return Object.entries(yoyChange)
          .sort((a, b) => {
            return a[0] - b[0];
          })
          .map((el) => [parseInt(el[0]), el[1]]);
      } else if (transformMode === "yoyabs") {
        const originalData = [...vals];
        const finVals = convertToMonthsView(originalData);
        const yoyChange = {};
        for (const key in finVals) {
          const date = new Date(parseInt(key));
          const yearago = new Date(
            Date.UTC(date.getUTCFullYear() - 1, date.getUTCMonth(), 1)
          );
          const yearagokey = String(yearago.getTime());
          if (yearagokey in finVals) {
            yoyChange[key] = finVals[key] - finVals[yearagokey];
          }
        }
        return Object.entries(yoyChange)
          .sort((a, b) => {
            return a[0] - b[0];
          })
          .map((el) => [parseInt(el[0]), el[1]]);
      } else if (transformMode === "mom") {
        const originalData = [...vals];
        const finVals = convertToMonthsView(originalData);
        const momChange = {};
        for (const key in finVals) {
          const date = new Date(parseInt(key));
          let monthago;
          if (date.getUTCMonth() !== 0) {
            monthago = new Date(
              Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)
            );
          } else {
            monthago = new Date(Date.UTC(date.getUTCFullYear() - 1, 11, 1));
          }
          const monthagokey = String(monthago.getTime());
          if (monthagokey in finVals) {
            momChange[key] =
              (100 * (finVals[key] - finVals[monthagokey])) /
              finVals[monthagokey];
          }
        }
        return Object.entries(momChange)
          .sort((a, b) => {
            return a[0] - b[0];
          })
          .map((el) => [parseInt(el[0]), el[1]]);
      } else if (transformMode === "momabs") {
        const originalData = [...vals];
        const finVals = convertToMonthsView(originalData);
        const momChange = {};
        for (const key in finVals) {
          const date = new Date(parseInt(key));
          let monthago;
          if (date.getUTCMonth() !== 0) {
            monthago = new Date(
              Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)
            );
          } else {
            monthago = new Date(Date.UTC(date.getUTCFullYear() - 1, 11, 1));
          }
          const monthagokey = String(monthago.getTime());
          if (monthagokey in finVals) {
            momChange[key] = finVals[key] - finVals[monthagokey];
          }
        }
        return Object.entries(momChange)
          .sort((a, b) => {
            return a[0] - b[0];
          })
          .map((el) => [parseInt(el[0]), el[1]]);
      } else if (
        transformMode === "rollingMean" ||
        transformMode === "rollingSum"
      ) {
        const originalData = [...vals];
        const finVals = [];
        const rollingWindow = transformProps?.rollingWindow;
        for (let idx = rollingWindow; idx < originalData.length + 1; idx++) {
          const windowedArray = [...originalData]
            .slice(idx - rollingWindow, idx)
            .map((el) => el[1]);
          const windowedSum = windowedArray.reduce((a, b) => a + b, 0);
          if (transformMode === "rollingMean") {
            const windowedMean = (1 * windowedSum) / rollingWindow;
            finVals.push([originalData[idx - 1][0], windowedMean]);
          } else {
            finVals.push([originalData[idx - 1][0], windowedSum]);
          }
        }
        return finVals;
      }
      return vals;
    };

    let seriesToPlot;
    let yaxis;
    let legendEnabled;

    let useutctime = true;
    let rangeSelector = { enabled: false };
    if (data?.freq === "Dynamic") {
      useutctime = true;
      rangeSelector.enabled = false;
    }

    if (data?.dataJSON instanceof Array) {
      // contains trends for just a single datapoint
      let color;
      legendEnabled = false;
      if ("dataColors" in data) {
        color = data.dataColors[0];
      } else {
        color = "#377eb8";
      }
      seriesToPlot = [
        {
          type: "areaspline",
          name: data.seriesName || data.title,
          data: transformData(
            data.dataJSON || [],
            props.transformMode,
            props.transformProps
          ),
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, "rgba(67, 104, 247, 0.05)"],
              //this controls how quickly the gradient deepens
              [0.2, "rgba(67, 104, 247, 0.075)"], //this controls how quickly the gradient deepens
              [1, "rgba(67, 104, 247, 0.002)"],
            ],
          },
          lineWidth: 0,
        },
        {
          type: "spline",
          name: data.seriesName || data.title,
          data: transformData(
            data.dataJSON || [],
            props.transformMode,
            props.transformProps
          ),
          color: props?.style?.mainGraphColor || "rgba(67, 104, 247, 1)",
          lineWidth: props?.style?.lineWidth || 1.5,
        },
      ];

      yaxis = {
        labels: {
          style: {
            fontSize: String(props.style?.axisLabelSize) || 14 + "px",
            fontFamily: props.style?.axisLabelFont || "Source Sans Pro",
            color: props.style?.axisColor || undefined,
          },
        },
        title: {
          text: data?.uom,
          style: {
            fontSize: "10px",
            fontFamily: props.style?.titleFont || "Inter",
            color: props.style?.axisColor || undefined,
          },
        },
        plotLines: [{ value: 0, width: 1, color: "rgba(216, 218, 229, 1)" }],
        gridLineColor: props.style?.axisLineColor || "rgba(216, 218, 229, 1)",
        gridLineDashStyle: "Dash",
      };
    } else {
      // combining multiple data points together
      // important note: don't use an area chart here, use a line chart or spline
      legendEnabled = true;
      seriesToPlot = [];
      const defaultColors = [
        "#4368F7",
        "#F2AA3C",
        "#C5BC6D",
        "#84C56D",
        "#EE8351",
        "#E7686E",
        "#7243F7",
      ];
      let colorIdx = 0;
      for (const key in data?.dataJSON) {
        let color;
        if ("dataColors" in data) {
          color = data.dataColors[key];
        } else {
          color = defaultColors[colorIdx];
        }
        // later, can have an array of colors
        if ("transformOptions" in data) {
          seriesToPlot.push({
            type: "spline",
            name: key,
            data: transformData(
              data.dataJSON[key],
              data.transformOptions[key]?.transformMode,
              data.transformOptions[key]?.transformMode
            ),
            color: color,
            lineWidth: props?.style?.lineWidth || 1.5,
          });
          colorIdx += 1;
        }
      }

      yaxis = {
        title: {
          text: data?.compare === true ? "%age change" : data?.uom,
          style: {
            fontSize: "10px",
            fontFamily: props.style?.titleFont || "Inter",
            color: props.style?.axisColor || undefined,
          },
        },
        labels: {
          style: {
            fontSize: String(props.style?.axisLabelSize) || 14 + "px",
            fontFamily: props.style?.axisLabelFont || "Source Sans Pro",
            color: props.style?.axisColor || undefined,
            class: "apply-font-axis",
          },
        },
        plotLines: [
          {
            value: 0,
            width: 1,
            color: "rgba(216, 218, 229, 1)",
          },
        ],
        gridLineColor: props?.style?.axisLineColor || "rgba(216, 218, 229, 1)",
        gridLineDashStyle: "Dash",
      };
    }

    const options = {
      chart: {
        // marginLeft: 0,
        // marginRight: 0,
        backgroundColor: props.style?.backgroundColor || "#fff",
        zoomType: "x",
        animation: false,
        height:
          props.height !== "undefined" && props.height ? props.height : 280,
        panning: false,
      },
      navigator: { enabled: false },
      rangeSelector: rangeSelector,
      // time: {
      //   useUTC: useutctime,
      // },
      title: {
        text: props?.noTitle ? null : data?.title,
        align: "left",
        style: {
          color: props.style?.textColor || undefined,
          fontSize:
            data?.title?.length <= 50 || props.standaloneChart
              ? String(props.style?.titleSize) || 19 + "px"
              : String(props.style?.smallTitleSize) || 16 + "px",
          fontFamily: props.style?.titleFont || "Inter",
        },
      },
      legend: {
        enabled: legendEnabled,
        itemStyle: {
          fontWeight: "400",
          color: props.style?.textColor || undefined,
        },
      },
      xAxis: {
        title: {
          // text: data.title,
          text: null,
          style: {
            fontSize: "10px",
            fontFamily: props.style?.titleFont || "Inter",
            color: props.style?.textColor || undefined,
          },
        },
        labels: {
          style: {
            fontSize: String(props.style?.axisLabelSize) || 14 + "px",
            fontFamily: props.style?.axisLabelFont || "Source Sans Pro",
            color: props.style?.axisColor || undefined,
          },
        },
        type: "category", //previous, this was "datetime"
        // tickPixelInterval: 100,
        zoomEnabled: false,
        gridLineColor: props.style?.axisLineColor || "rgba(216, 218, 229, 1)",
        gridLineDashStyle: "Solid",
        gridLineWidth: 1,
      },
      exporting: {
        scale: 2,
        sourceWidth: props.height || 280,
        sourceHeight: props.height || 280,
        enabled: false,
      },
      yAxis: yaxis,
      // tooltip: {
      //   xDateFormat: data?.freq === "Annual" ? "%Y": data?.freq === "Quarterly" ? "%b %Y" : data?.freq === "Monthly" ? "%b %Y" : undefined,
      //   pointFormat: data?.compare === true
      //     ? '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>'
      //     : '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
      // },
      plotOptions: {
        series: {
          marker: { enabled: false },
          animation: {
            duration: 0,
          },
          compare: data?.compare === true ? "percent" : null,
          threshold: -Infinity,
        },
      },
      credits: { enabled: false },
      series: seriesToPlot,
    };
    return (
      <ErrorBoundary>
        <Row>
          {/* <Col span={24}>
          <button onClick={() => {console.log(props); forceUpdate();}}>Refresh</button>
        </Col> */}
          <Col span={24}>
            <Chart options={options} />
          </Col>
        </Row>
      </ErrorBoundary>
    );
  },
  () => false
);

TrendChart.displayName = "TrendChart";

export default TrendChart;

import React from 'react';
import { Table } from 'antd';
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from './Charts/ColumnChart.jsx';
import TrendChart from './Charts/TrendChart.jsx';

const DefogDynamicViz = ({vizType, response, rawData, query, debugMode}) => {
  let results;
  if (vizType === "table") {
    results = <Table
      dataSource={response.data}
      columns={response.columns}
      style={{
        maxHeight: 300,
        overflow: "auto",
      }}
      size="small"
      pagination={{ pageSize: 5}}
    />
  } else if (vizType === "piechart") {
    results = <PieChart
      resourceId={null}
      data={{
        dataJSON: rawData.map((el) => ({ name: el[0], y: el[1] })),
        title: query,
      }}
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  } else if (vizType === "columnchart") {
    results = <ColumnChart
      resourceId={null}
      data={{
        dataJSON: rawData.map((el) => el[1]),
        xAxisCategories: rawData.map((el) => el[0]),
        title: query,
      }}
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  } else if (vizType === "trendchart") {
    results = <TrendChart
      resourceId={null}
      data={{
        dataJSON: rawData,
        title: query,
      }}
      transformMode="base"
      height={400}
      standaloneChart={false}
      logo={null}
      noTitle={false}
    />
  }

  return <div>    
    {results}
    {debugMode && <div className="rateQualityContainer">
      <p>How did we do with is this query?</p>
      <button style={{backgroundColor: "#fff"}} onClick={() => console.log("Good")}>👍 Great </button>
      <button style={{backgroundColor: "#fff"}} onClick={() => console.log("Bad")}>👎 Bad </button>
    </div>
    }
  </div>
}

export default React.memo(DefogDynamicViz, () => true);
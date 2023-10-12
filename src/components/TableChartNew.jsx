import React, { isValidElement, Fragment, useEffect, useState } from "react";
import { Tabs, Table, Button, message } from "antd";
import ChartContainer from "./ChartContainer";
import {
  chartNames,
  processData,
  reFormatData,
  roundColumns,
} from "./common/utils";
import { TableOutlined, BarChartOutlined } from "@ant-design/icons";
import ErrorBoundary from "./common/ErrorBoundary";
import ChartImage from "./ChartImage";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-python";

// import "prismjs/themes/prism.css";
import AgentLoader from "./common/AgentLoader";
import Lottie from "lottie-react";

import LoadingLottie from "./svg/loader.json";
import { ThemeContext, lightThemeColor } from "../context/ThemeContext";
import { styled } from "styled-components";
import { setupWebsocketManager } from "./common/websocket-manager";

const getTableData = async (tableId) => {
  const url = "https://agents.defog.ai/get_table_chart";
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table_id: tableId,
      }),
    });
    return response.json();
  } catch (e) {
    return;
  }
};

export function TableChartNew({ tableId }) {
  // always have a table
  // round decimal cols to 2 decimal places

  const [response, setResponse] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [socketManager, setSocketManager] = useState(null);
  const [sql, setSql] = useState(null);
  const [codeStr, setCodeStr] = useState(null);
  let extraTabs = [];

  function onMessage(msg) {
    let newTableData = null;
    newTableData = JSON.parse(msg.data);
    // console.log("Ran again response", newTableData);
    if (!newTableData.success) return;

    // newTableData = msg.table_data;

    // const colNames = newTableData.data_csv.split("\n")[0].split(",");
    // const rows = newTableData.data_csv
    //   .split("\n")
    //   .slice(1)
    //   .map((d) => d.split(","));

    // const r = reFormatData(rows, colNames);

    // setResponse({
    //   columns: r.newCols,
    //   data: r.newRows,
    // });

    // setTableData(newTableData);
    // setSql(newTableData.sql);
    // setCodeStr(newTableData.code);
  }

  useEffect(() => {
    // on first render, connect to the backend, to get/send the latest

    async function setupSocket() {
      try {
        const mgr = await setupWebsocketManager(
          "wss://agents.defog.ai/table_chart",
          onMessage,
        );
        setSocketManager(mgr);
        let tableData = await getTableData(tableId);
        if (!tableData.success) return;
        tableData = tableData.table_data;

        const colNames = tableData.data_csv.split("\n")[0].split(",");
        const rows = tableData.data_csv
          .split("\n")
          .slice(1)
          .map((d) => d.split(","));

        const r = reFormatData(rows, colNames);

        setResponse({
          columns: r.newCols,
          data: r.newRows,
        });

        setTableData(tableData);
        setSql(tableData.sql);
        setCodeStr(tableData.code);
      } catch (e) {
        console.log(e);
      }
    }
    setupSocket();
  }, [tableId]);

  const updateCodeAndSql = (updateProp = null, newVal) => {
    // send the latest sql or code to the backend
    if (updateProp !== "sql" && updateProp !== "code") return;
    if (!socketManager) return;
    if (!tableId) return;
    if (!newVal) return;

    if (updateProp === "sql") {
      setSql(newVal);
    }
    if (updateProp === "code") {
      setCodeStr(newVal);
    }

    setTableData((prev) => {
      return {
        ...prev,
        [updateProp]: newVal,
        edited: true,
      };
    });

    socketManager.send({
      table_id: tableId,
      data: {
        [updateProp]: newVal,
      },
    });
  };

  // extra tabs should be an array and all elements should be jsx components
  if (
    !extraTabs ||
    !Array.isArray(extraTabs) ||
    !extraTabs.every((d) => d.component && d.tabLabel) ||
    !extraTabs.every((d) => isValidElement(d.component))
  ) {
    extraTabs = [];
  }

  if (!tableData || !response)
    return (
      <ThemeContext.Provider
        value={{ theme: { type: "light", config: lightThemeColor } }}
      >
        <AgentLoader
          message={"Loading table"}
          lottie={<Lottie animationData={LoadingLottie} loop={true} />}
        />
      </ThemeContext.Provider>
    );

  const roundedData = roundColumns(response.data, response.columns);
  const chartImages = tableData.chart_images;

  let results = [
    {
      component: (
        <Table
          key="0"
          dataSource={roundedData}
          // don't show index column in table
          columns={response.columns.filter((d) => d.title !== "index")}
          scroll={{ x: "max-content" }}
          style={{
            maxHeight: 300,
          }}
          size="small"
          pagination={{ pageSize: 5, showSizeChanger: false }}
        />
      ),
      tabLabel: "Table",
      icon: <TableOutlined />,
    },
  ];

  if (!chartImages || chartImages.length <= 0) {
    const {
      xAxisColumns,
      categoricalColumns,
      yAxisColumns,
      xAxisColumnValues,
      dateColumns,
    } = processData(response.data, response.columns);

    results.push({
      component: (
        <ErrorBoundary>
          <ChartContainer
            xAxisColumns={xAxisColumns}
            dateColumns={dateColumns}
            categoricalColumns={categoricalColumns}
            yAxisColumns={yAxisColumns}
            xAxisColumnValues={xAxisColumnValues}
            data={response.data}
            columns={response.columns}
            title={tableData.query}
            key="1"
            vizType={"Bar Chart"}
          ></ChartContainer>
        </ErrorBoundary>
      ),
      tabLabel: "Chart",
      icon: <BarChartOutlined />,
    });
  } else {
    // if chartImagePath is present, load the image of the chart instead
    results.push({
      component: (
        <ErrorBoundary>
          <ChartImage images={chartImages} />
        </ErrorBoundary>
      ),
      tabLabel: chartNames[chartImages[0].type] || "Chart",
    });
  }
  if (sql !== null) {
    // show the sql query
    results.push({
      component: (
        <ErrorBoundary>
          <>
            <p>The following query was generated:</p>
            <pre className="language-sql">
              <Editor
                value={sql}
                highlight={(code) => highlight(code, languages.sql, "sql")}
                padding={10}
                onValueChange={(newVal) => updateCodeAndSql("sql", newVal)}
              />
            </pre>
          </>
        </ErrorBoundary>
      ),
      tabLabel: "SQL",
    });
  }

  if (codeStr !== null) {
    // show the codeStr query
    results.push({
      component: (
        <ErrorBoundary>
          <>
            <p>The following code was run:</p>
            <pre className="language-python">
              <Editor
                value={codeStr}
                highlight={(code) =>
                  highlight(code, languages.python, "python")
                }
                padding={10}
                onValueChange={(newVal) => updateCodeAndSql("code", newVal)}
              />
            </pre>
          </>
        </ErrorBoundary>
      ),
      tabLabel: "Code",
    });
  }

  // push extra tabs
  results = results.concat(extraTabs);

  // convert to antd tabs
  results = (
    <Tabs
      tabBarExtraContent={
        tableData.edited ? (
          <Button onClick={runAgain} className="edited-button" type="primary">
            Run again
          </Button>
        ) : (
          <></>
        )
      }
      defaultActiveKey={!chartImages || !chartImages.length ? "0" : "1"}
      items={results.map((d, i) => ({
        key: String(i),
        label: (
          <span>
            {d.icon ? d.icon : null}
            {d.tabLabel ? d.tabLabel : `Tab-${i}`}
          </span>
        ),
        children: d.component,
      }))}
    ></Tabs>
  );

  function runAgain() {
    if (!socketManager.isConnected() || !socketManager) {
      message.error("Not connected to the servers.");
      return;
    }
    // else send it
    socketManager.send({
      run_again: true,
      table_id: tableId,
      data: tableData,
    });
  }

  return <TableChartWrap>{results}</TableChartWrap>;
}

const TableChartWrap = styled.div`
  position: relative;
`;

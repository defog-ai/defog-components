import React, { useState, useContext, Fragment } from "react";
import { Button, Table, message, Tabs, Modal, Input } from "antd";
import PieChart from "./Charts/PieChart.jsx";
import ColumnChart from "./Charts/ColumnChart.jsx";
import TrendChartNew from "./Charts/TrendChartNew.jsx";
import { download_csv, roundColumns, transformToCSV } from "./common/utils.js";
import { TableOutlined, BarChartOutlined } from "@ant-design/icons";
import styled from "styled-components";
import ThumbsUp from "./svg/ThumbsUp.js";
import ThumbsDown from "./svg/ThumbsDown.js";
import { ThemeContext } from "../context/ThemeContext.js";

const DefogDynamicViz = ({
  vizType,
  response,
  rawData,
  query,
  debugMode,
  apiKey,
}) => {
  const { theme } = useContext(ThemeContext);
  const [narrative, setNarrative] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { TextArea } = Input;

  console.log(theme);

  const uploadFeedback = (feedback, feedbackText = "") => {
    if (feedback === "Good") {
      fetch(`https://api.defog.ai/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey,
          response: response,
          feedback: feedback,
        }),
      });
    } else {
      fetch(`https://api.defog.ai/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey,
          response: response,
          feedback: feedback,
          text: feedbackText,
        }),
      });

      setModalVisible(false);
    }

    feedback === "Good"
      ? message.success(
          "We are glad that this was a good result. Thank you for the feedback!"
        )
      : message.info(
          "Thank you for the feedback, we will use your feedback to make the results better!"
        );
  };

  let results;
  if (vizType === "text") {
    results = <pre>{response.results}</pre>;
  } else {
    // always have a table
    // round decimal cols to 2 decimal places
    const roundedData = roundColumns(response.data, response.columns);

    results = [
      <Table
        dataSource={roundedData}
        columns={response.columns}
        scroll={{ x: "max-content" }}
        style={{
          maxHeight: 300,
        }}
        size="small"
        pagination={{ pageSize: 5 }}
      />,
    ];

    // if there's a viztype specified, show that
    if (vizType === "piechart") {
      results.push(
        <PieChart
          data={{
            // dataJSON: rawData.map((el) => ({ name: el[0], y: el[1] })),
            data: rawData,
            columns: response.columns,
            title: query,
          }}
          height={400}
        />
      );
    } else if (vizType === "columnchart" || vizType === "chart") {
      results.push(
        <ColumnChart
          data={{
            // dataJSON: rawData.map((el) => ({ x: el[0], y: el[1] })),
            data: rawData,
            columns: response.columns,
            // xAxisCategories: rawData.map((el) => el[0]),
            title: query,
          }}
          height={400}
        />
      );
    } else if (vizType === "trendchart") {
      results.push(
        <TrendChartNew
          data={{
            data: rawData,
            columns: response.columns,
            title: query,
          }}
          height={400}
        />
      );
    } else {
      // by default, show column chart
      results.push(
        <ColumnChart
          data={{
            data: rawData,
            columns: response.columns,
            title: query,
          }}
          height={400}
        />
      );
    }
    // convert to antd tabs
    results = (
      <Tabs
        defaultActiveKey={vizType === "table" ? "0" : "1"}
        items={results.map((d, i) => ({
          key: String(i),
          label: (
            <span>
              {i === 0 ? <TableOutlined /> : <BarChartOutlined />}
              {i === 0 ? "Table" : "Chart"}
            </span>
          ),
          children: d,
        }))}
      ></Tabs>
    );
  }

  const csvDownload = (
    <div className="exportNarativeBtn">
      <Button
        onClick={() =>
          download_csv(
            transformToCSV(
              rawData,
              response.columns.map((d) => d.title)
            )
          )
        }
      >
        Download CSV
      </Button>

      <Button
        loading={narrativeLoading}
        onClick={async () => {
          setNarrativeLoading(true);
          const resp = await fetch(
            `https://api.defog.ai/generate_data_insights`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                apiKey: apiKey,
                data: {
                  data: rawData,
                  columns: response.columns,
                },
              }),
            }
          );
          const data = await resp.json();
          setNarrative(data.response);
          setNarrativeLoading(false);
        }}
      >
        Get Narrative
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        title="To improve the model, could you please give more details about why this is a bad query? :)"
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <TextArea rows={4} id="feedback-text" placeholder="Optional" />
        <Button
          onClick={() => {
            uploadFeedback(
              "Bad",
              document.getElementById("feedback-text").value
            );
          }}
        >
          Submit
        </Button>
      </Modal>
      <div>
        <ResultsWrap theme={theme.config}>
          {results && results}
          {csvDownload}
        </ResultsWrap>
        {debugMode && (
          <RateQualityContainer theme={theme.config}>
            {response.generatedSql && (
              <>
                <p>The following query was generated:</p>
                <pre>{response.generatedSql}</pre>
              </>
            )}

            {narrative && (
              <div className="generatedNarrative">
                <p>Narrative</p>
                {narrative}
              </div>
            )}
          </RateQualityContainer>
        )}
        <FeedbackWrap theme={theme.config}>
          <p>How did we do with is this query?</p>
          <button onClick={() => uploadFeedback("Good")}>
            <ThumbsUp />
          </button>
          <button onClick={() => uploadFeedback("Bad")}>
            <ThumbsDown />
          </button>
        </FeedbackWrap>
      </div>
    </>
  );
};

export default React.memo(DefogDynamicViz, () => true);

const ResultsWrap = styled.div`
  position: relative;
  width: 100%;

  .ant-tabs-nav {
    margin-bottom: 0;
  }
  .ant-tabs-tabpane {
    border-top: none;
  }
  .ant-tabs-nav {
    border: none !important;
  }
  .ant-tabs-content-holder {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    padding: 12px;
    border-radius: 0px 0px 7px 7px;
    overflow: hidden;
  }
  .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    height: 100%;
    border-radius: 7px 7px 0px 0px;
  }
  .ant-tabs-tab {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    padding: 12px 20px;
    border-radius: 7px 7px 0px 0px;
    opacity: 0.5;
    overflow: hidden;

    &:hover {
      opacity: 0.75;
    }
  }
  .ant-tabs-tab.ant-tabs-tab-active {
    opacity: 1;
  }
  .ant-tabs .ant-tabs-tab .ant-tabs-tab-btn {
    position: relative;
    z-index: 5;
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-tabs .ant-tabs-tab + .ant-tabs-tab {
    margin: 0 0 0 2px;
  }

  .ant-table-wrapper .ant-table {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-table-wrapper .ant-table-thead > tr > th,
  .ant-table-wrapper .ant-table-thead > tr > td {
    background: ${(props) =>
      props.theme ? props.theme.background2 : "#F8FAFB"};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-table-wrapper .ant-table-column-sorter {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-table-wrapper .ant-table-thead th.ant-table-column-has-sorters:hover {
    background: ${(props) =>
      props.theme ? props.theme.background1 : "#F8FAFB"};
  }
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background: ${(props) =>
      props.theme ? props.theme.background1 : "#F8FAFB"};
  }

  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr.ant-table-row:hover
    > td:first-child,
  .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr
    > td.ant-table-cell-row-hover:first-child,
  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr.ant-table-row.ant-table-row-selected
    > td:first-child {
    border-start-start-radius: 2px;
    border-end-start-radius: 2px;
  }

  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr.ant-table-row:hover
    > td:last-child,
  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr
    > td.ant-table-cell-row-hover:last-child,
  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr.ant-table-row.ant-table-row-selected
    > td:last-child {
    border-start-end-radius: 2px;
    border-end-end-radius: 2px;
  }

  .ant-table-wrapper
    .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(
      .ant-table-row-expand-icon-cell
    ):not([colspan])::before,
  .ant-table-wrapper
    .ant-table-thead
    > tr
    > td:not(:last-child):not(.ant-table-selection-column):not(
      .ant-table-row-expand-icon-cell
    ):not([colspan])::before {
    background-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }

  .ant-table-wrapper .ant-table-thead > tr > th,
  .ant-table-wrapper .ant-table-thead > tr > td {
    border-bottom-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }

  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr
    > td {
    border-top-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
    border-bottom-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }
  .ant-table-wrapper
    .ant-table:not(.ant-table-bordered)
    .ant-table-tbody
    > tr:last-child
    > td {
    border-top-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
    border-bottom-color: ${(props) =>
      props.theme ? props.theme.greyBorder : "#F8FAFB"};
  }
  .ant-pagination .ant-pagination-item a {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-pagination .ant-pagination-item-active {
    background: ${(props) => (props.theme ? props.theme.background1 : "#FFF")};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-pagination
    .ant-pagination-jump-prev
    .ant-pagination-item-container
    .ant-pagination-item-ellipsis,
  .ant-pagination
    .ant-pagination-jump-next
    .ant-pagination-item-container
    .ant-pagination-item-ellipsis {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }

  .ant-pagination-item-link span {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  }
  .ant-pagination .ant-pagination-item-active {
    border-color: ${(props) =>
      props.theme ? props.theme.branColor : "#2B59FF"};
  }

  .exportNarativeBtn {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    gap: 2px;

    @media (max-width: 650px) {
      position: relative;
      margin-top: 12px;
      gap: 12px;
    }

    button {
      background: ${(props) =>
        props.theme ? props.theme.background2 : "#F8FAFB"};
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
      border-radius: 7px 7px 0px 0px;
      min-height: 46px;
      border: none;
      box-shadow: none;

      @media (max-width: 650px) {
        border-radius: 7px;
        width: 100%;
      }
    }
  }
`;

const RateQualityContainer = styled.div`
  color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  & > p:nth-of-type(1) {
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 0px;
  }

  & > pre {
    margin-top: 6px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 4px;
    white-space: pre-line;
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.15);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #1677ffc4;
      border-radius: 2px;
    }
  }

  & > .generatedNarrative {
    margin-bottom: 20px;
    p {
      font-weight: 600;
      margin-top: 20px;
      margin-bottom: 0px;
    }
  }
`;

const FeedbackWrap = styled.div`
  background: ${(props) => (props.theme ? props.theme.background2 : "#F8FAFB")};
  color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
  border-radius: 7px;
  display: inline-flex;
  padding: 12px;
  font-size: 14px;
  gap: 12px;
  margin-top: 20px;
  line-height: 1;
  @media (max-width: 650px) {
    padding: 12px;
    gap: 8px;
  }

  & > p {
    margin: 0;
    margin-right: 20px;
    @media (max-width: 650px) {
      font-size: 13px;
      margin-right: 12px;
    }
  }
  & > button {
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    svg {
      width: 12px;
      height: 12px;
      @media (max-width: 650px) {
        width: 12px;
        height: 12px;
      }
    }

    &:nth-of-type(2) {
      transform: translateY(4px);
    }

    &:hover {
      svg {
        path {
          fill: #444;
        }
      }
    }
  }
`;

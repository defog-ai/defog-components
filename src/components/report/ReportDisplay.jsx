import React, { useEffect, Fragment } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import { csvTable, postprocess } from "../report-gen/marked-extensions";
import { styled } from "styled-components";
import WriterGroup from "../agent/WriterGroup";
import Lottie from "lottie-react";
import LoadingLottie from "../svg/loader.json";
import AgentLoader from "../common/AgentLoader";

marked.use({ extensions: [csvTable], hooks: { postprocess } });

export function ReportDisplay({ sections, theme, loading }) {
  // marked lexer through each section, parse each of the generated tokens, and render it using the Writer

  // sort sections according to section number
  const sortedSections = sections.slice().map((d) => ({
    ...d,
    tokens: marked.lexer(d.text).filter((d) => d.type != "space"),
  }));

  sortedSections.sort((a, b) => a.section_number - b.section_number);

  // useEffect(() => {
  //   if (!window.renders || !window.renders.length) return;

  //   window.renders.forEach((item) => {
  //     const Component = item.component;
  //     const root = createRoot(document.getElementById(item.id));
  //     root.render(
  //       <Component {...item.props} apiKey={apiKey} apiEndpoint={apiEndpoint} />,
  //     );
  //   });
  // });

  return (
    <ReportWrap theme={theme.config}>
      {sortedSections.map((section) => (
        <WriterGroup
          key={section.section_number}
          items={section.tokens.map((d, i) => {
            return {
              ...d,
              key: section.section_number + "-" + i,
              emptyHtml: marked.parse(d.raw),
              animate: true,
            };
          })}
        />
      ))}
      {loading ? (
        <AgentLoader
          message={"Generating report..."}
          lottie={<Lottie animationData={LoadingLottie} loop={true} />}
        />
      ) : (
        <></>
      )}
    </ReportWrap>
  );
}

const ReportWrap = styled.div`
  white-space: pre-wrap;
  max-width: 800px;
  margin: 4em auto;
  .csv-table {
    width: 100%;
    min-width: 400px;
    margin: 0 0 4em;
  }

  // ant styles
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
  .ant-table-wrapper .ant-table-column-sorter-up.active,
  .ant-table-wrapper .ant-table-column-sorter-down.active {
    color: ${(props) => (props.theme ? props.theme.brandColor : "#2B59FF")};
  }

  .ant-table-wrapper td.ant-table-column-sort {
    background: ${(props) =>
      props.theme ? props.theme.background3 : "#F8FAFB"};
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

  .chart-container-select h4 {
    color: ${(props) => (props.theme ? props.theme.primaryText : "#F8FAFB")};
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
      props.theme ? props.theme.brandColor : "#2B59FF"};
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background-color: ${(props) =>
      props.theme ? props.theme.background1 : "#FFF"};
    border: 1px solid
      ${(props) => (props.theme ? props.theme.brandColor : "#FFF")};
    color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};

    & + .ant-select-arrow {
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};
    }
  }
`;

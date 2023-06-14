import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { marked } from "marked";
import { csvTable } from "./marked-extensions";
import { styled } from "styled-components";

marked.use({ extensions: [csvTable] });

export function Report({ markdown }) {
  useEffect(() => {
    if (!window.renders || !window.renders.length) return;

    window.renders.forEach((item) => {
      const Component = item.component;
      ReactDOM.render(
        <Component {...item.props} />,
        document.getElementById(item.id)
      );
    });
  });

  return (
    <ReportWrap>
      <div
        dangerouslySetInnerHTML={{
          __html: marked.parse(markdown),
        }}
      ></div>
    </ReportWrap>
  );
}

const ReportWrap = styled.div`
  white-space: pre-wrap;
  max-width: 90%;
  margin: 0 auto;
  .csv-table {
    width: 70%;
    min-width: 500px;
  }
`;

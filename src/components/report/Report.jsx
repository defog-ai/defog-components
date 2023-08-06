import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import { csvTable } from "./marked-extensions";

marked.use({ extensions: [csvTable] });

export function Report({ markdown, apiKey, apiEndpoint }) {
  useEffect(() => {
    if (!window.renders || !window.renders.length) return;

    window.renders.forEach((item) => {
      const Component = item.component;
      const root = createRoot(document.getElementById(item.id));
      root.render(
        <Component {...item.props} apiKey={apiKey} apiEndpoint={apiEndpoint} />,
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
  max-width: 800px;
  margin: 4em auto;
  .csv-table {
    width: 100%;
    min-width: 400px;
    margin: 0 0 4em;
  }
`;

import { TableChart } from "../TableChart";
import { reFormatData } from "../common/utils";

import React from "react";
// Add ask defog chat to table chart
import { AskDefogChat } from "../../index";
import { Logo } from "../svg/Logo";
import { styled } from "styled-components";

const AskDefogWrap = styled.div`
  .results-panel .ant-collapse-extra {
    display: none;
  }
`;

function ReportTableChart({ response, apiKey, apiEndpoint }) {
  return (
    <TableChart
      response={response}
      extraTabs={[
        {
          component: (
            <AskDefogWrap>
              <AskDefogChat apiEndpoint={apiEndpoint} apiKey={apiKey} />
            </AskDefogWrap>
          ),
          tabLabel: "Explore more",
          icon: <Logo />,
        },
      ]}
    />
  );
}

export const csvTable = {
  name: "csvTable",
  level: "block",
  start(src) {
    return src.match(/^(<csv>)/)?.index;
  },
  tokenizer(src) {
    const rule = /^(?:<csv>)([\s\S]*?)(?:<\/csv>)(?:\n|$)/;
    const match = rule.exec(src);
    if (match) {
      const token = {
        type: "csvTable",
        raw: match[0],
        text: match[1].trim(),
        tokens: [],
      };
      this.lexer.inline(token.text, token.tokens);
      return token;
    }
  },
  renderer(token) {
    const randomId = `csv-table-${Math.floor(Math.random() * 100000)}`;
    const colNames = token.text.split("\n")[0].split(",");

    const rows = token.text
      .split("\n")
      .slice(1)
      .map((d) => d.split(","));

    const r = reFormatData(rows, colNames);

    window.renders = window.renders || [];
    window.renders.push({
      id: randomId,
      text: token.text,
      component: ReportTableChart,
      props: {
        response: {
          columns: r.newCols,
          data: r.newRows,
        },
      },
    });

    return `<div class="csv-table" id="${randomId}"></div>`;
  },
};

export function postprocess(html) {
  let tag = null;
  let tagWithattrs = null;

  try {
    // insert "writer-target" as the class for whatever the html tag is
    html.replace(/<([^/]*?)>/g, (match, p1) => {
      // if match has class already, add to the class
      if (p1.indexOf("class") > -1) {
        tagWithattrs = p1.replace('class="', 'class="writer-target ');
      } else {
        tagWithattrs = p1 + ' class="writer-target"';
      }
      tag = p1.split(" ")[0];
      return;
    });

    return `<${tagWithattrs}></${tag}>`;
  } catch (e) {
    console.log(e);
    return html;
  }
}

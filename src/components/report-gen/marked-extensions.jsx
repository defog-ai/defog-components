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

function ReportTableChart({
  response,
  apiKey,
  apiEndpoint,
  chartImages = null,
  sql,
}) {
  return (
    <TableChart
      response={response}
      chartImages={chartImages}
      sql={sql}
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
    // find if there's an <sql> or <report-plot> tag
    // if so, save it separately
    let sql = token.text.match(/<sql>[\s\S]*<\/sql>/);
    if (sql) {
      // remove this from the token.text
      token.text = token.text.replace(sql[0], "");
      sql = sql[0];
    }

    // find chart image
    let chartImages = Array.from(
      token.text.matchAll(/<report-img-chart[\s\S]*?<\/report-img-chart>/gi),
    );
    if (chartImages.length) {
      chartImages.forEach((chartImage, i) => {
        try {
          // remove this from the token.text
          token.text = token.text.replace(chartImage[0], "");
          // get chartType
          chartImages[i] = {
            path: chartImage[0].match(/path="(.*)" /)[1],
            type: chartImage[0].match(/type="(.*)"/)[1],
          };
        } catch (err) {
          console.log(err);
        }
      });
    }

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
        sql,
        chartImages,
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
  let tagWithAttrs = null;

  try {
    // insert "writer-target" as the class for whatever the html tag is
    // also set contenteditable to true
    html.replace(/<([^/]*?)>/g, (match, p1) => {
      // if match has class already, add to the class
      if (p1.indexOf("class") > -1) {
        tagWithAttrs = p1.replace('class="', 'class="writer-target ');
      } else {
        tagWithAttrs = p1 + ' class="writer-target"';
      }
      tag = p1.split(" ")[0];
      return;
    });

    // make all non csv table tags editable
    return `<${tagWithAttrs} ${
      tagWithAttrs.indexOf("csv-table") > -1 ? "" : 'contenteditable="true"'
    }></${tag}>`;
  } catch (e) {
    console.log(e);
    return html;
  }
}

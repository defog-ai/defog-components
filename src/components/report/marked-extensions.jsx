import { styled } from "styled-components";
import { TableChart } from "../TableChart";
import { reFormatData } from "../common/utils";

export const csvTable = {
  name: "csvTable",
  level: "block",
  start(src) {
    return src.match(/^(<csv>)/)?.index;
  },
  tokenizer(src, tokens) {
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

    const columns = colNames.map((d) => ({
      title: d,
      dataIndex: d,
      key: d,
    }));

    const rows = token.text
      .split("\n")
      .slice(1)
      .map((d) => d.split(","));

    const r = reFormatData(rows, colNames);

    window.renders = window.renders || [];
    window.renders.push({
      id: randomId,
      text: token.text,
      component: TableChart,
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

import { Table } from "antd";

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

    const rows = token.text.split("\n").slice(1);
    const tableJson = [];
    rows.forEach((row, i) => {
      const rowJson = {};
      row.split(",").forEach((cell, index) => {
        rowJson[colNames[index]] = cell;
      });
      rowJson.key = i;
      tableJson.push(rowJson);
    });

    window.renders = window.renders || [];
    window.renders.push({
      id: randomId,
      text: token.text,
      component: Table,
      props: {
        dataSource: tableJson,
        columns: columns,
      },
    });

    return `<div class="csv-table" id="${randomId}"></div>`;
  },
};

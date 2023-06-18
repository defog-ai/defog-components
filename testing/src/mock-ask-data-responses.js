// mock various kinds of results with a similar (but broken) structure to the defog servers return value
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import {
  randomiseArray,
  randomSlice,
  log,
  testResponseProp,
} from "./mock-data-utils";
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

const mockColumns = [
  "date",
  "day",
  "week",
  "month",
  "qtr",
  "year",
  "value_a",
  "value_b",
  "value_c",
  "holiday",
];

const commonVals = ["", [], null, undefined, "delete"];

const timeFormats = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DD",
  "YYYY-MM",
];

function createData(columns, decimalColumns = [], onlyDates = false) {
  const nrows = Math.random() * 100;
  const data = [];
  const baseDate = dayjs(new Date(Math.random() * 1000000000000));
  const tfs = randomiseArray(timeFormats);

  for (let i = 0; i < nrows; i++) {
    const row = [];
    for (let j = 0; j < columns.length; j++) {
      // push a random value
      // if date, push a random date
      const colName = columns[j];
      let val;
      switch (colName) {
        case "date":
          val = baseDate.add(Math.random() * 100, "day");
          // jitter baseDate a little bit
          if (onlyDates) {
            val = val.format(tfs[j % tfs.length]);
          } else {
            val = val.toISOString().slice(0, -5);
          }
          break;
        case "week":
          val = Math.ceil(Math.random() * 52);
          break;
        case "month":
          val = Math.ceil(Math.random() * 12);
          if (onlyDates) {
            val = dayjs(val.toString(), "M").format(tfs[j % tfs.length]);
          }
          break;
        case "qtr":
          val = Math.ceil(Math.random() * 4);
          break;
        case "year":
          val = Math.floor(Math.random() * 10000);
          if (onlyDates) {
            val = dayjs(val.toString(), "YYYY").format(tfs[j % tfs.length]);
          }

          break;
        case "day":
          val = Math.floor(Math.random() * 7);
          break;
        case "holiday":
          val = Math.random() > 0.5;
          break;
        case "value_a":
        case "value_b":
        case "value_c":
        default:
          // randomly create integer column
          val =
            decimalColumns.indexOf(colName) >= 0
              ? Math.random() * 100
              : Math.floor(Math.random() * 100);
      }

      row.push(val);
    }
    data.push(row);
  }
  return data;
}

function createAskDataResponseObject(newProps = {}, testVals = null) {
  let selectedCols = randomSlice(mockColumns);

  const base = {
    columns: selectedCols,
    data: createData(selectedCols),
    previous_context: [
      "test",
      "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ],
    query_generated: "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ran_successfully: true,
    reason_for_query:
      "The user's question is not provided, so I will generate a query that selects all columns from the `date` table and orders the results by `caldate` in ascending order. This query will retrieve all the dates in the database and order them chronologically.",
    suggestion_for_further_questions:
      "aslgdnlj asdljnasoj asdojn sdoflja asdovja sdvjknasdovjn ",
  };

  return Object.assign(base, newProps);
}

function* validResponse() {
  log("Testing with valid response.");

  yield createAskDataResponseObject();
}

function* onlyQuantitativeColumns() {
  let selectedCols = mockColumns.filter((col) => col.startsWith("value"));
  log("Testing with only quantitative columns.");

  yield createAskDataResponseObject({
    columns: selectedCols,
    data: createData(selectedCols, ["value_c"]),
  });
}

function* noData() {
  const testVals = commonVals.slice().filter((d) => d !== "");
  testVals.push([null]);

  yield* testResponseProp({}, "data", createAskDataResponseObject, testVals);
}

function* noColumns() {
  yield* testResponseProp(
    {},
    "columns",
    createAskDataResponseObject,
    commonVals.slice()
  );
}

function* noSQL() {
  yield* testResponseProp(
    {},
    "query_generated",
    createAskDataResponseObject,
    commonVals.slice()
  );
}

function* onlyDates() {
  let selectedCols = mockColumns.slice(0, 6);
  log("Testing with only date columns.");

  yield createAskDataResponseObject({
    columns: selectedCols,
    data: createData(selectedCols, [], true),
  });
}

export const chartTypes = [
  "pie chart",
  "piechart",
  "bar chart",
  "barchart",
  "column chart",
  "columnchart",
  "trend chart",
  "trendchart",
  "line chart",
  "linechart",
];

function* charts() {
  for (let i = 0; i < chartTypes.length; i++) {
    // always have data for charts

    log(`Testing with "${chartTypes[i]}" in the query.`);
    const res = createAskDataResponseObject({
      columns: mockColumns.slice(),
      data: createData(mockColumns.slice(), [], true),
    });

    yield res;
  }
}

function* queryRunFailure() {
  log("Testing ran_successfully = false.");
  const res = createAskDataResponseObject();
  res.ran_successfully = false;

  yield res;
}

export function* testCases() {
  const tests = [
    onlyDates,
    onlyQuantitativeColumns,
    validResponse,
    queryRunFailure,
    noData,
    noColumns,
    noSQL,
  ];

  // will always have to test charts first unfortunately.
  // can't figure out how to test and keep the chart type in the query (without editing src/index.js) otherwise
  tests.unshift(charts);

  for (let i = 0; i < tests.length; i++) {
    yield* tests[i]();
  }
}

export function nextTestBtnClick() {
  if (window && !window.testsFinished && window.autoTesting) {
    const nextTestBtn = document.querySelector(
      "#test-controller .next-test-btn"
    );
    nextTestBtn.click();
  }
}

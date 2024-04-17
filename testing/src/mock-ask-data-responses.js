// mock various kinds of results with a similar (but broken) structure to the defog servers return value
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import { randomiseArray, randomSlice, log, testResponseProp } from "./utils";
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

const monthShortnames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const monthLongnames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const mockColumns = [
  "name",
  "date1",
  "date2",
  "date3",
  "date4",
  "month_numeric",
  "month_short",
  "month_long",
  "week_padded_string",
  "week_numeric",
  "year_numeric",
  "year_string",
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

function createData(columns, decimalColumns = [], skipColumns = []) {
  const nrows = Math.random() * 100;
  const data = [];
  const baseDate = dayjs(new Date(Math.random() * 1000000000000));
  const tfs = randomiseArray(timeFormats);

  // randomly create integer column
  const numericRanges = [10, 1000, 100000, -1000, -10];
  let _r = numericRanges.slice();

  // pre-pick indexes in numericRanges for value_a, value_b and value_c
  const _r_idx = {};
  ["value_a", "value_b", "value_c"].forEach((col) => {
    const idx = Math.floor(Math.random() * _r.length);

    _r_idx[col] = idx;
  });

  for (let i = 0; i < nrows; i++) {
    const row = [];
    for (let j = 0; j < columns.length; j++) {
      // push a random value
      // if date, push a random date
      const colName = columns[j];
      if (skipColumns.indexOf(colName) >= 0) {
        continue;
      }
      let val;

      switch (colName) {
        case "name":
          // create random string
          val = Math.random().toString(36).substring(2, 15);
          break;
        case "date1":
        case "date2":
        case "date3":
        case "date4":
          val = baseDate.add(Math.random() * 100, "day");
          // jitter baseDate a little bit
          val = val.format(tfs[j % tfs.length]);

          break;
        case "week_padded_string":
          // generate strins padded with 0
          val = Math.ceil(Math.random() * 52)
            .toString()
            .padStart(2, "0");
          break;
        case "week_numeric":
          val = Math.ceil(Math.random() * 52);

          break;
        case "month_numeric":
          val = Math.ceil(Math.random() * 12);

          break;
        case "month_short":
          val = monthShortnames[Math.floor(Math.random() * 12)];
          break;
        case "month_long":
          val = monthLongnames[Math.floor(Math.random() * 12)];
          break;
        case "year_string":
          val = Math.floor(Math.random() * 30) + 2000 + "";
          break;
        case "year_numeric":
          val = Math.floor(Math.random() * 30) + 2000;

          break;
        case "holiday":
          val = Math.random() > 0.5 ? "yes" : "no";
          break;
        case "value_a":
        case "value_b":
        case "value_c":
        default:
          const max = _r_idx[colName] ? _r[_r_idx[colName]] : 1000;

          val =
            decimalColumns.indexOf(colName) >= 0
              ? Math.random() * max
              : Math.floor(max * Math.random());
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
  log("validResponse: Testing with valid response.");

  yield createAskDataResponseObject({
    columns: mockColumns.slice(),
    data: createData(mockColumns.slice()),
  });
}

function* noQuantitativeColumns() {
  let selectedCols = mockColumns.filter((col) => !col.startsWith("value"));
  log("noQuantitativeColumns: Testing with no quantitative columns.");

  const res = createAskDataResponseObject({
    columns: selectedCols,
    data: createData(selectedCols),
  });
  yield res;
}

function* onlyQuantitativeColumns() {
  let selectedCols = mockColumns.filter((col) => col.startsWith("value"));
  log("onlyQuantitativeColumns: Testing with only quantitative columns.");

  yield createAskDataResponseObject({
    columns: selectedCols,
    data: createData(selectedCols, ["value_c"]),
  });
}

function* noData() {
  const testVals = commonVals.slice().filter((d) => d !== "");
  testVals.push([null]);

  log("noData: Testing with no data.");

  yield* testResponseProp({}, "data", createAskDataResponseObject, testVals);
}

function* noColumns() {
  log("noColumns: Testing with no columns.");
  yield* testResponseProp(
    {},
    "columns",
    createAskDataResponseObject,
    commonVals.slice(),
  );
}

function* noSQL() {
  log = "noSQL: Testing with no SQL query generated.";
  yield* testResponseProp(
    {},
    "query_generated",
    createAskDataResponseObject,
    commonVals.slice(),
  );
}

function* onlyDates() {
  log("onlyDates: Testing with only date columns.");
  let skipColumns = ["name", "holiday", "value_a", "value_b", "value_c"];

  let selectedCols = mockColumns.slice();

  yield createAskDataResponseObject({
    columns: selectedCols.filter((col) => skipColumns.indexOf(col) < 0),
    data: createData(selectedCols, [], skipColumns),
  });
}

function* queryRunFailure() {
  log("queryRunFailure: Testing ran_successfully = false.");
  const res = createAskDataResponseObject();
  res.ran_successfully = false;

  yield res;
}

function* noDates() {
  let skipColumns = [
    "date",
    "month",
    "year",
    "test_year",
    "test_date",
    "month_short",
  ];

  log(`noDates: Testing with no date columns.`);
  const res = createAskDataResponseObject({
    columns: mockColumns.slice().filter((col) => skipColumns.indexOf(col) < 0),
    // skip columns that are easy to parse
    data: createData(mockColumns.slice(), [], skipColumns),
  });

  yield res;
}

// this is the core function
export function* testCases() {
  // add your tests to this array
  const tests = [
    // noQuantitativeColumns,
    // onlyDates,
    // noDates,
    // onlyQuantitativeColumns,
    validResponse,
    // queryRunFailure,
    // noData,
    // noColumns,
    // noSQL,
  ];

  let i = 0;
  while (true) {
    const incOrDec = (yield tests[i]) === "prev" ? -1 : 1;

    i = (tests.length + i + incOrDec) % tests.length;

    yield* tests[i]();
  }
}

export function nextTestBtnClick() {
  if (window && !window.testsFinished && window.autoTesting) {
    const nextTestBtn = document.querySelector(
      "#test-controller .next-test-btn",
    );
    nextTestBtn.click();
  }
}

// mock various kinds of results with a similar (but broken) structure to the defog servers return value
import dayjs from "dayjs";

const mockColumns = [
  "date",
  "day",
  "week",
  "month",
  "qtr",
  "year",
  "value_a",
  "value_b",
  "holiday",
];

const commonVals = ["", [], null, undefined, "delete"];

function createData(columns) {
  const nrows = Math.random() * 100;
  const data = [];
  const baseDate = dayjs(new Date(Math.random() * 1000000000000));

  for (let i = 0; i < nrows; i++) {
    const row = [];
    for (let j = 0; j < columns.length; j++) {
      // push a random value
      // if date, push a random date
      const colName = columns[j];
      let val;
      switch (colName) {
        case "dateid":
        case "caldate":
          // jitter baseDate a little bit
          val = baseDate
            .add(Math.random() * 100, "day")
            .toISOString()
            .slice(0, -5);
          break;
        case "week":
          val = Math.floor(Math.random() * 52);
          break;
        case "month":
          val = Math.floor(Math.random() * 12);
          break;
        case "qtr":
          val = Math.floor(Math.random() * 4);
          break;
        case "year":
          val = Math.floor(Math.random() * 10000);
          break;
        case "day":
          val = Math.floor(Math.random() * 7);
          break;
        case "holiday":
          val = Math.random() > 0.5;
          break;
        case "value_a":
        case "value_b":
        default:
          val = Math.random() * 100;
      }

      row.push(val);
    }
    data.push(row);
  }
  return data;
}

// random slice of an array
function randomSlice(arr) {
  const start = Math.floor(Math.random() * arr.length);
  const end = Math.floor(Math.random() * (arr.length - start)) + start;
  return arr.slice(start, end);
}

function* resultYielder(baseObj, prop, vals) {
  for (let i = 0; i < vals.length; i++) {
    global.logStr =
      `Testing ${prop} prop. Current value:` +
      JSON.stringify(vals[i] === "" ? "empty string" : vals[i]);

    console.log(
      `Testing %c${prop}\x1b[0m prop. Current value:`,
      "color: #ff0000",
      vals[i] === "" ? "empty string" : vals[i]
    );

    if (vals[i] === "delete") {
      delete baseObj[prop];
    } else {
      baseObj[prop] = vals[i];
    }

    yield baseObj;
  }
}

export function* testValid() {
  let selectedCols = randomSlice(mockColumns);
  console.log("Testing with valid data");

  // valid result
  yield {
    // random slice
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
}

export function* testNoData() {
  let selectedCols = randomSlice(mockColumns);
  const testVals = commonVals.slice().filter((d) => d !== "");
  testVals.push([null]);

  const baseResult = {
    columns: randomSlice(selectedCols),
    data: [],
    previous_context: [
      "test",
      "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ],
    query_generated: "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ran_successfully: true,
    reason_for_query:
      "The user's question is not provided, so I will generate a query that selects all columns from the `date` table and orders the results by `caldate` in ascending order. This query will retrieve all the dates in the database and order them chronologically.",
    suggestion_for_further_questions: null,
  };

  yield* resultYielder(baseResult, "data", testVals);
}

export function* testNoColumns() {
  let selectedCols = randomSlice(mockColumns);
  const testVals = commonVals.slice();

  const baseResult = {
    columns: [],
    data: createData(selectedCols),
    previous_context: [
      "test",
      "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ],
    query_generated: "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ran_successfully: true,
    reason_for_query:
      "The user's question is not provided, so I will generate a query that selects all columns from the `date` table and orders the results by `caldate` in ascending order. This query will retrieve all the dates in the database and order them chronologically.",
    suggestion_for_further_questions: null,
  };

  yield* resultYielder(baseResult, "columns", testVals);
}

export function* testNoSQL() {
  let selectedCols = randomSlice(mockColumns);
  const testVals = commonVals.slice();

  const baseResult = {
    columns: selectedCols,
    data: createData(selectedCols),
    previous_context: [
      "test",
      "SELECT * FROM date ORDER BY caldate ASC NULLS LAST;",
    ],
    query_generated: null,
    ran_successfully: true,
    reason_for_query:
      "The user's question is not provided, so I will generate a query that selects all columns from the `date` table and orders the results by `caldate` in ascending order. This query will retrieve all the dates in the database and order them chronologically.",
    suggestion_for_further_questions: null,
  };

  yield* resultYielder(baseResult, "query_generated", testVals);
}

export function* testCases() {
  const tests = [testNoData, testNoColumns, testNoSQL, testValid];
  for (let i = 0; i < tests.length; i++) {
    yield* tests[i]();
  }
}

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

// random slice
function randomSlice(arr) {
  const start = Math.floor(Math.random() * arr.length);
  const end = Math.floor(Math.random() * (arr.length - start)) + start;
  return arr.slice(start, end);
}

export function getValidResult() {
  let selectedCols = randomSlice(mockColumns);
  // valid result
  return {
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

// no data result
export const noDataResult = {
  columns: [
    "dateid",
    "caldate",
    "day",
    "week",
    "month",
    "qtr",
    "year",
    "holiday",
  ],
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

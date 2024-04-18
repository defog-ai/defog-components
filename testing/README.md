# testing

This folder lets us conduct various tests for the UI. From _within_ the `testing/` folder, run:

1. `npm install`
2. `npm run start`

This will start a live reload server, that serves the UI directly from defog-components (using relative import in `package.json`). Your changes to the defog-components will auto reload the page.

The tests can also be made to run automatically in a loop (just click the "Resume auto testing" button).

# How it works

There's two sets of functions, both generators:

1. One is the `testCases` function inside `mock-ask-data-responses.js`. This goes through all your tests, and yields each one in turn. It also simulates a click on the "Next Test" button in the test controller UI.
2. The other type are the test functions itself. These are individual tests you want to run. For example, you might want to test missing data, or missing columns, or a query that fails. These are also generator functions that create a response object (mimicking what we get from the defog api), which are then are yielded from the `testCases` function, which sends it to the UI.

# How to add your own tests

Let's say we want to create tests for testing the UI when there's no quantitative columns in the data.

The columns by default are:

```js
// date, month, month_short, test_year, test_date, year will be parsed as dates
// value_a, value_b, value_c will be parsed as numbers
// name and holiday will be parsed as a string
// to add new columns, add them here + inside switch/case in the createData function
const mockColumns = [
  "name",
  "date",
  "month",
  "month_short",
  "test_year",
  "test_date",
  "year",
  "value_a",
  "value_b",
  "value_c",
  "holiday",
];
```

The major workhorse of this is the `createData` function, that takes in some parameters, and creates fake data with it.

```js
function createData(
    // the columns you want to create data for
    // if any of these don't exist in the mock columns above, they will be created with data type numbers
    // if you want to handle a new column, add it in two places:
    // 1. in the mockColumns array above
    // 2. inside the switch case within this function which will handle your new column
    // decimalColumns: if you want any columns to be decimals, add them here
    // skipColumns: if you want to skip any columns, add them here
  columns,
  decimalColumns = [],
  skipColumns = [],
) {
    ...
}
```

You will need to create a new test function in `mock-ask-data-responses.js`, and call createData and createAskDataResponseObject to create a response object.

This is what it might look like:

```js
// note that this is a generator function yielding a response object
// you can even yield multiple response objects from this function.
// just keep yielding response objects until you're done with the test.
function* noQuantitativeColumns() {
  // logs are good
  log("noQuantitativeColumns: Testing with no quantitative columns.");

  // remove quant columns
  let selectedCols = mockColumns.filter((col) => !col.startsWith("value"));

  // createAskDataResponseObject is the function that will take your columns and data, and create a response object mimicking what we get from the defog server.
  yield createAskDataResponseObject({
    columns: selectedCols,
    data: createData(selectedCols),
  });
}
```

Then go inside `testCases` function in `mock-ask-data-responses.js`, and add your new test function to the tests array.

```js
export function* testCases() {
  // add your tests to this array
  const tests = [
    ...
    noQuantitativeColumns,
  ];
  ...
}
```

# Files

## mock-ask-data-responses.js

The is the core file that contains several functions that generate mock data and response objects. These include:

- `createData`: This function generates a random set of data based on the provided parameters. It creates a variety of data types including dates, strings, and numbers.

- `createAskDataResponseObject`: This function creates a mock response object that mimics the structure of a typical response from the defog server.

- `validResponse`, `noQuantitativeColumns`, `onlyQuantitativeColumns`, `noData`, `noColumns`, `noSQL`, `onlyDates`, `dateParsingTest`, `charts`, `queryRunFailure`, `noDates`: These are generator functions that yield specific types of response objects for testing different scenarios.

- `testCases`: This is the core function that runs the tests. It cycles through the array of tests, yielding each one in turn.

- `nextTestBtnClick`: This function simulates a click on the "Next Test" button in the test controller UI.

This file's functions are used in `src/index.jsx`

## utils.js

The file contains the following functions:

- `randomiseArray`: This function takes an array as input and returns a new array with the elements shuffled in a random order.

- `randomSlice`: This function takes an array as input and returns a random slice of the array. The start and end indices of the slice are randomly generated.

- `log`: This function logs a string to the console and also assigns it to `window.logStr`. It takes two optional parameters, `s1` and `s2`. If `s2` is provided, it is assigned to `window.logStr`, otherwise `s1` is assigned.

- `testResponseProp`: This is a generator function that takes four parameters: `newProps`, `prop`, `baseResponseObjectCreator`, and `vals`. It creates a new response object using `baseResponseObjectCreator` and `newProps`, then assigns `vals[i]` to `res[prop]` for each `i` in `vals`. If `vals[i]` is "delete", it deletes `res[prop]`. It logs the current value of `prop` and yields `res`.

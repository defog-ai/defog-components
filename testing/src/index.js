import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { noDataResult, getValidResult } from "./mock-defog-result";

global.fetch = (url, options) => {
  console.log(url, options);
  return Promise.resolve({
    json: () => Promise.resolve(getValidResult()),
  });
};

// window.fetch = global.fetch;

ReactDOM.render(<App />, document.getElementById("root"));

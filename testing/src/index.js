import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { testCases } from "./mock-defog-result";

const tests = (global.tests = testCases());

global.fetch = (url, options) => {
  return Promise.resolve({
    json: () => {
      const res = tests.next();

      const log = document.getElementById("log");
      log.innerHTML = global.logStr;

      if (res.done) {
        log.innerHTML = "All tests finished!";
        return Promise.reject("All tests finished!");
      }

      return Promise.resolve(res.value);
    },
  });
};

window.fetch = global.fetch;

ReactDOM.render(<App />, document.getElementById("root"));

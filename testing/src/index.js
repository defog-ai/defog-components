import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import { testCases } from "./mock-defog-result";
import App from "./App";

const tests = (global.tests = testCases());

global.fetch = (url, options) => {
  return Promise.resolve({
    json: () => {
      const res = tests.next();

      const log = document.getElementById("log");
      log.innerHTML = window.logStr;

      if (res.done) {
        log.innerHTML = "All tests finished!";
        window.logStr = "All tests finished!";
        return Promise.resolve();
      }

      return Promise.resolve(res.value);
    },
  });
};

window.fetch = global.fetch;

ReactDOM.render(<App />, document.getElementById("root"));

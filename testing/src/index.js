import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import { autoTest, testCases } from "./mock-defog-result";
import App from "./App";

const tests = testCases();

window.autoTesting = true;
window.testsFinished = false;

window.fetch = (url, options) => {
  return Promise.resolve({
    json: () => {
      const res = tests.next();

      const log = document.getElementById("log");
      log.innerHTML = window.logStr;

      if (res.done) {
        log.innerHTML = "All tests finished!";
        window.logStr = "All tests finished!";
        window.testsFinished = true;

        return Promise.resolve({ ran_successfully: true });
      }

      setTimeout(autoTest, 1000);

      return Promise.resolve(res.value);
    },
  });
};

ReactDOM.render(<App />, document.getElementById("root"));

import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { nextTestBtnClick, testCases } from "./mock-ask-data-responses";

window.autoTesting = true;
window.testsFinished = false;

window.testCases = testCases();

window.nextRes = window.testCases.next();

window.testingInterval = {
  start: () =>
    (window.intervalId = setInterval(() => {
      if (window.autoTesting) {
        window.nextRes = window.testCases.next();
        nextTestBtnClick();
      }
    }, 1000)),
  stop: () => clearInterval(window.intervalId),
};

window.fetch = () => {
  return Promise.resolve({
    json: () => {
      const res = window.nextRes;

      const log = document.getElementById("log");
      log.innerHTML = window.logStr;

      if (res.done) {
        log.innerHTML = "All tests finished!";
        window.logStr = "All tests finished!";
        window.testsFinished = true;

        return Promise.resolve({ ran_successfully: true });
      }

      return Promise.resolve(res.value);
    },
  });
};

ReactDOM.render(
  <App />,
  document.getElementById("root"),
  window.testingInterval.start
);
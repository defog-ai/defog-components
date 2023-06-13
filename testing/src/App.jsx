import React, { useState, Fragment, useEffect, useCallback } from "react";
import { AskDefogChat } from "defog-react";
import { Button } from "antd";
import { autoTest, chartTypes } from "./mock-defog-result";

function* yieldChartTypes() {
  yield* chartTypes.slice();
}

const cT = yieldChartTypes();

const App = () => {
  const [key, setKey] = useState(0);
  const [dummy, setDummy] = useState(0);

  const handleClick = () => {
    window.autoTesting = !window.autoTesting;
    if (window.autoTesting) {
      setTimeout(autoTest, 1000);
    }
    setDummy(dummy + 1);
  };

  useEffect(() => {
    // unfortunately.. we always test charts first because of the way the tests are set up
    const c = cT.next();

    const defogQuery = document.getElementsByClassName("ant-input")[0];
    defogQuery.value = "test " + (c.value ? c.value : "");

    const defogSubmit = document.querySelector("#results .ant-btn");
    defogSubmit.click();
  }, [key]);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100px",
          display: "flex",
          alignItems: "start",
          flexDirection: "column",
          marginLeft: "20px",
          marginTop: "20px",
        }}
        id="test-controller"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Button
            key={key}
            className="next-test-btn"
            onClick={() => setKey(key + 1)}
            disabled={window.testsFinished}
            style={{
              opacity: window.autoTesting ? 0 : 1,
              height: window.autoTesting ? 0 : "auto",
              marginRight: window.autoTesting ? 0 : "20px",
              width: window.autoTesting ? 0 : "auto",
              pointerEvents: window.autoTesting ? "none" : "auto",
            }}
          >
            Next test
          </Button>

          <Button
            className="pause-auto-test-btn"
            onClick={handleClick}
            disabled={window.testsFinished}
          >
            {window.autoTesting ? "Pause auto testing" : "Resume auto testing"}
          </Button>
        </div>
        <p id="log"></p>
      </div>

      <div style={{ width: "100%" }}>
        <AskDefogChat
          key={key}
          maxWidth={"100%"}
          maxHeight={500}
          apiEndpoint=""
          buttonText={"Ask Defog"}
          personality={"sarcastic and aloof"}
          debugMode={true}
          apiKey={"test"}
          // additionalParams={{ "test": "test" }}
          // additionalHeaders={{ "test": "test" }}
        />
      </div>
    </>
  );
};

export default App;

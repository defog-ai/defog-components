import React, { useState, useEffect, Fragment } from "react";
import { AskDefogChat } from "defog-components";
import { Button } from "antd";

const App = () => {
  const [key, setKey] = useState(0);
  const [dummy, setDummy] = useState(0);

  const toggleAutoTesting = () => {
    window.autoTesting = !window.autoTesting;
    if (!window.autoTesting) {
      window.testingInterval.stop();
    } else {
      window.testingInterval.start();
    }
    // to trigger re render to show the "next test" button
    // but NOT re click the ask defog button (that is driven by the key prop as in the useEffect below)
    setDummy(dummy + 1);
  };

  useEffect(() => {
    const defogQuery = document.getElementsByClassName("ant-input")[0];
    defogQuery.value = window.logStr;

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
            onClick={() => {
              if (!window.autoTesting) window.nextRes = window.testCases.next();
              setKey(key + 1);
            }}
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
            onClick={toggleAutoTesting}
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

import React, { useState, Fragment, useEffect } from "react";
import { AskDefogChat } from "defog-react";
import { Button } from "antd";
import { chartTypes } from "./mock-defog-result";

function* yieldChartTypes() {
  yield* chartTypes.slice();
}

const cT = yieldChartTypes();

const App = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // we always test charts first because of the way the tests are set up
    const c = cT.next();

    const input = document.getElementsByClassName("ant-input")[0];
    input.value = "test " + (c.value ? c.value : "");

    const btn = document.querySelector("#results .ant-btn");
    btn.click();
  });

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
        <Button
          onClick={() => setKey(key + 1)}
          disabled={window.logStr === "All tests finished!"}
        >
          Next test
        </Button>
        <p id="log"></p>
      </div>

      <div style={{ width: "100%" }}>
        <AskDefogChat
          key={key}
          maxWidth={"100%"}
          maxHeight={500}
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
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

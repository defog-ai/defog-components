import React, { useState, Fragment, useEffect } from "react";
import { AskDefogChat } from "defog-react";
import { Button } from "antd";

const App = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const input = document.getElementsByClassName("ant-input")[0];
    input.value = "test";

    const btn = document.querySelector("#results .ant-btn");
    btn.click();
  });

  console.log(window.logStr, window.logStr === "All tests finished!");

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
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

import React from "react";
import { AskDefogChat } from "defog-react";

const App = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div style={{ width: "100%" }}>
        <AskDefogChat
          maxWidth={"100%"}
          maxHeight={"100%"}
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          // apiEndpoint="http://127.0.0.1:3000/"
          // apiEndpoint="https://defog-gcp-ktcmdcmg4q-uc.a.run.app"
          buttonText={"Ask Defog"}
          debugMode={true}
          apiKey={"test"}
          sqlOnly={false}
          dashboard={false}
          enableNarrative={false}
          // additionalParams={{ "test" : "test"}}
          // additionalHeaders={{ "test": "test" }}
        />
      </div>
    </div>
  );
};

export default App;

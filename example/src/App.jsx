import React from "react";
import { AskDefogChat } from "defog-components";

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
          // apiEndpoint="https://us-central1-defog-backend.cloudfunctions.net/agents-gcp"
          buttonText={"Ask Defog"}
          debugMode={true}
          apiKey={"test"}
          sqlOnly={false}
          dashboard={false}
          enableNarrative={false}
          darkMode={false}
          // agent={true}
          // narrativeEnabled={false}
          // additionalParams={{ "test" : "test"}}
          // additionalHeaders={{ "test": "test" }}
        />
      </div>
    </div>
  );
};

export default App;

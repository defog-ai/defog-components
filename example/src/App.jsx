import React from "react";
import { AskDefogChat } from "../../src/index";

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
          baseDefogUrl={"https://api.defog.ai"}
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          buttonText={"Ask Defog"}
          debugMode={true}
          // demoMode={true}
          sqlOnly={false}
          dashboard={false}
          darkMode={false}
          clearOnAnswer={true}
        />
      </div>
    </div>
  );
};

export default App;

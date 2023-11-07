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
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          buttonText={"Ask Defog"}
          debugMode={false}
          sqlOnly={false}
          dashboard={false}
          enableNarrative={false}
          darkMode={false}
        />
      </div>
    </div>
  );
};

export default App;

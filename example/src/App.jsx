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
          apiEndpoint={import.meta.env.VITE_API_ENDPOINT}
          buttonText={"Ask Defog"}
          debugMode={true}
          // apiKey={import.meta.env.VITE_API_KEY}
          sqlOnly={false}
          agent={false}
          darkMode={false}
        />
      </div>
    </div>
  );
};

export default App;

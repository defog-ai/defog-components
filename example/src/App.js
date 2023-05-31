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
      <div style={{ width: "30%" }}>
        <h1>Testing Defog</h1>
      </div>
      <div style={{ width: "40%" }}>
        <AskDefogChat
          maxWidth={"100%"}
          maxHeight={600}
          // apiEndpoint="http://127.0.0.1:8000/generate_query_chat"
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          buttonText={"Ask Defog"}
          personality={"sarcastic and aloof"}
          // mode={"websocket"}
          debugMode={true}
          apiKey={"test"}
        />
      </div>
    </div>
  );
};

export default App;

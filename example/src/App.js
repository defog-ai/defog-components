import React from "react";
import { AskDefogChat } from "defog-react";

const App = () => {
  return (
    <AskDefogChat
      maxWidth={"100%"}
      maxHeight={"100%"}
      // apiEndpoint="http://127.0.0.1:8000/generate_query_chat"
      apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
      buttonText={"Ask Defog"}
      personality={"sarcastic and aloof"}
      // mode={"websocket"}
      debugMode={true}
      apiKey={"test"}
    />
  );
};

export default App;

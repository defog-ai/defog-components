import React from "react";
import { AskDefogChat } from "defog-react";

const App = () => {
  return (
    <AskDefogChat
      maxWidth={"100%"}
      maxHeight={"100%"}
      apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
      buttonText={"Ask Defog"}
      personality={"sarcastic and aloof"}
      // mode={"websocket"}
      // debugMode={true}
      // apiKey={"1"}
    />
  );
};

export default App;

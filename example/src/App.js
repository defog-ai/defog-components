import React from "react";

import { AskDefogChat } from "defog-react";
// import 'defog-react/dist/index.css'

const App = () => {
  return (
    <AskDefogChat
      maxWidth={"100%"}
      maxHeight={"100%"}
      //apiEndpoint="ws://127.0.0.1:8000/ws"
      apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
      buttonText={"Ask Defog"}
      //mode={"websocket"}
      mode={"http"}
      debugMode={true}
      // apiKey={"1"}
    />
  );
};

export default App;

import React from "react";

import { AskDefogChat } from "defog-react";
// import 'defog-react/dist/index.css'

const App = () => {
  return (
    <AskDefogChat
      maxWidth={"100%"}
      maxHeight={"100%"}
      apiEndpoint="ws://127.0.0.1:8000/ws"
      buttonText={"Ask Defog"}
      // debugMode={true}
      // apiKey={"1"}
    />
  );
};

export default App;

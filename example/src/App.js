import React from "react";
import { AskDefogChat } from "defog-react";

const App = () => {
  return (
    <AskDefogChat
      maxWidth={"100%"}
      maxHeight={"100%"}
      apiEndpoint="http://127.0.0.1:8000/generate_query_chat"
      buttonText={"Ask Defog"}
      personality={"irreverent, sarcastic, witty"}
      // mode={"websocket"}
      // debugMode={true}
      // apiKey={"1"}
    />
  );
};

export default App;

import React from "react";

import { AskDefogChat } from "defog-react";
// import 'defog-react/dist/index.css'

const App = () => {
  return (
    <AskDefogChat
      maxWidth={"100%"}
      maxHeight={"100%"}
      apiEndpoint="http://127.0.0.1:8000/generate_query_chat"
      // additionalParams={{ tableName: "test_table_597d590ed3aa4c38a7231f0586360b90" }}
      buttonText={"Ask Defog"}
      debugMode={true}
      apiKey={"1"}
    />
  );
};

export default App;

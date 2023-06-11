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
          maxHeight={500}
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          // apiEndpoint="http://127.0.0.1:8080/generate_query_chat"
          // apiEndpoint="https://defog-gcp-ktcmdcmg4q-uc.a.run.app"
          buttonText={"Ask Defog"}
          personality={"sarcastic and aloof"}
          debugMode={true}
          apiKey={"test"}
          sqlOnly={false}
          additionalParams={
            {
              // api_key:
              //   "",
              // db_type: "",
            }
          }
          // additionalHeaders={{ "test": "test" }}
        />
      </div>
    </div>
  );
};

export default App;

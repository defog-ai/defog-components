import React from "react";
import { AskDefogChat } from "defog-react";

window.realFetch = window.fetch;

window.fetch = function () {
  return Promise.resolve({
    json: () => {
      return Promise.resolve({
        ran_successfully: true,
        sub_qns: `[
          {
            "tool": "sql_aggregator",
            "sub_qn": "What are the top-selling products by revenue?",
            "reason":
              "Identifying top-selling products helps focus on promoting them."
          },
          {
            "tool": "sql_aggregator",
            "sub_qn":
              "Which sales representatives have the highest sales numbers?",
            "reason":
              "Recognizing high-performing sales representatives can help improve overall sales."
          },
          {
            "tool": "sql_aggregator",
            "sub_qn": "What is the trend of total sales over time?",
            "reason":
              "Understanding sales trends helps in making informed business decisions."
          },
          {
            "tool": "py_column_summarizer",
            "sub_qn":
              "What are the average and median values of remaining passes for purchased items?",
            "reason":
              "Knowing the usage of remaining passes can help optimize the offerings."
          },
          {
            "tool": "sql_aggregator",
            "sub_qn": "Which classes have the highest attendance rates?",
            "reason":
              "Focusing on popular classes can help improve customer satisfaction."
          }
        ]`,
      });
    },
  });
};

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
          apiEndpoint="http://127.0.0.1:8000/generate_query_chat"
          buttonText={"Ask Defog"}
          // personality={"sarcastic and aloof"}
          debugMode={true}
          apiKey={"test"}
          sqlOnly={false}
          // additionalHeaders={{ "test": "test" }}
        />
      </div>
    </div>
  );
};

export default App;

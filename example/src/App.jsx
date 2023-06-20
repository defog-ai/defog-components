import React from "react";
import { AskDefogChat } from "defog-react";

window.mockFetch = function () {
  return Promise.resolve({
    json: () => {
      return Promise.resolve({
        ran_successfully: true,
        sub_qns: `[
          {
            "tool": "sql_aggregator",
            "subqn": "What are the top-selling products by revenue?",
            "reason":
              "Identifying top-selling products helps focus on promoting them."
          },
          {
            "tool": "sql_aggregator",
            "subqn":
              "Which sales representatives have the highest sales numbers?",
            "reason":
              "Recognizing high-performing sales representatives can help improve overall sales."
          },
          {
            "tool": "sql_aggregator",
            "subqn": "What is the trend of total sales over time?",
            "reason":
              "Understanding sales trends helps in making informed business decisions."
          },
          {
            "tool": "py_column_summarizer",
            "subqn":
              "What are the average and median values of remaining passes for purchased items?",
            "reason":
              "Knowing the usage of remaining passes can help optimize the offerings."
          },
          {
            "tool": "sql_aggregator",
            "subqn": "Which classes have the highest attendance rates?",
            "reason":
              "Focusing on popular classes can help improve customer satisfaction."
          }
        ]`,
      });
    },
  });
};

// window.fetch = window.mockFetch;

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
          apiEndpoint={import.meta.env.VITE_AGENT_ENDPOINT}
          buttonText={"Ask Defog"}
          // personality={"sarcastic and aloof"}
          debugMode={true}
          apiKey={import.meta.env.VITE_API_KEY}
          sqlOnly={false}
          // additionalHeaders={{ "test": "test" }}
        />
      </div>
    </div>
  );
};

export default App;

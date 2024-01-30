import React from "react";
import { AskDefogChat } from "../../src/index";

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
          maxHeight={"100%"}
          apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          buttonText={"Ask Defog"}
          debugMode={false}
          demoMode={false}
          sqlOnly={false}
          dashboard={false}
          narrativeMode={true}
          darkMode={false}
          predefinedQuestions={[
            "What are my sales by brand?",
            "Which are my top performing users?",
            "Where am I lagging behind my targets",
            "Which products have had the highest increase in sales over the last 3 months in my area?",
            "Which of my accounts have reduced their spend the most over the last 3 months?",
          ]}
        />
      </div>
    </div>
  );
};

export default App;

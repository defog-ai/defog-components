import React from "react";
import { AskDefogChat } from "../../src/index";
// import Agent from "../../src/components/agent/Agent";
import { UtilsContext } from "../../src/context/UtilsContext";
import {
  darkThemeColor,
  lightThemeColor,
} from "../../src/context/ThemeContext";
import AgentMain from "../../src/components/agent/AgentMain";

const sub_qns = [
  {
    question:
      "The 'sales' table contains a column 'sales_rep_id' which indicates the ID of the sales representative who made the sale. This could potentially impact the assignment because certain sales representatives might be more or less effective at retaining customers. How can we incorporate this into our analysis to see if there's a correlation between sales representatives and customer churn?",
    full_answer:
      'Approach 1: Analyzing Sales Representative Effectiveness\n\nStep 1:\n```yaml\ndescription: "Identify churned customers"\nrequirements:\n    - name: "Churned customers"\n      table: "clients"\n      description: "Filter the \'clients\' table for site_id 757071 and within the last 12 months. Identify churned customers by looking at the \'active\' column. If the \'active\' status is false, then the customer has churned."\n      reason: "We need to identify which customers have churned in order to analyze their sales data."\n```\n\nStep 2:\n```yaml\ndescription: "Get sales data for churned customers"\nrequirements:\n    - name: "Sales data"\n      table: "sales"\n      description: "Join the \'sales\' table with the list of churned customers using the \'client_id\' and \'site_id\' columns. This will give us the sales data for each churned customer."\n      reason: "We need the sales data for churned customers to see which sales representatives were involved in their sales."\n```\n\nStep 3:\n```yaml\ndescription: "Analyze sales representative effectiveness"\nrequirements:\n    - name: "Sales representative data"\n      table: "sales"\n      description: "Group the sales data by \'sales_rep_id\' and count the number of churned customers for each sales representative. This will give us an idea of which sales representatives have the highest and lowest churn rates."\n      reason: "We want to see if there\'s a correlation between sales representatives and customer churn."\n```\n\nThis approach helps answer the question by identifying which sales representatives have the highest and lowest churn rates. If certain sales representatives have significantly higher churn rates than others, this could indicate that they are less effective at retaining customers. This information could be used to provide additional training or support to these sales representatives in order to reduce customer churn..',
    title: "Analyzing Sales Representative Effectiveness",
    reason:
      "This approach helps answer the question by identifying which sales representatives have the highest and lowest churn rates. If certain sales representatives have significantly higher churn rates than others, this could indicate that they are less effective at retaining customers. This information could be used to provide additional training or support to these sales representatives in order to reduce customer churn..",
    steps: [
      {
        description: "Identify churned customers",
        requirements: [
          {
            name: "Churned customers",
            table: "clients",
            description:
              "Filter the 'clients' table for site_id 757071 and within the last 12 months. Identify churned customers by looking at the 'active' column. If the 'active' status is false, then the customer has churned.",
            reason:
              "We need to identify which customers have churned in order to analyze their sales data.",
          },
        ],
      },
      {
        description: "Get sales data for churned customers",
        requirements: [
          {
            name: "Sales data",
            table: "sales",
            description:
              "Join the 'sales' table with the list of churned customers using the 'client_id' and 'site_id' columns. This will give us the sales data for each churned customer.",
            reason:
              "We need the sales data for churned customers to see which sales representatives were involved in their sales.",
          },
        ],
      },
      {
        description: "Analyze sales representative effectiveness",
        requirements: [
          {
            name: "Sales representative data",
            table: "sales",
            description:
              "Group the sales data by 'sales_rep_id' and count the number of churned customers for each sales representative. This will give us an idea of which sales representatives have the highest and lowest churn rates.",
            reason:
              "We want to see if there's a correlation between sales representatives and customer churn.",
          },
        ],
      },
    ],
    steps_yaml: [
      'description: "Identify churned customers"\nrequirements:\n    - name: "Churned customers"\n      table: "clients"\n      description: "Filter the \'clients\' table for site_id 757071 and within the last 12 months. Identify churned customers by looking at the \'active\' column. If the \'active\' status is false, then the customer has churned."\n      reason: "We need to identify which customers have churned in order to analyze their sales data."',
      'description: "Get sales data for churned customers"\nrequirements:\n    - name: "Sales data"\n      table: "sales"\n      description: "Join the \'sales\' table with the list of churned customers using the \'client_id\' and \'site_id\' columns. This will give us the sales data for each churned customer."\n      reason: "We need the sales data for churned customers to see which sales representatives were involved in their sales."',
      'description: "Analyze sales representative effectiveness"\nrequirements:\n    - name: "Sales representative data"\n      table: "sales"\n      description: "Group the sales data by \'sales_rep_id\' and count the number of churned customers for each sales representative. This will give us an idea of which sales representatives have the highest and lowest churn rates."\n      reason: "We want to see if there\'s a correlation between sales representatives and customer churn."',
    ],
  },
];

const theme = { type: "dark", config: lightThemeColor };

const App = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div style={{ width: "100%" }}>
        {/* <AskDefogChat
          maxWidth={"100%"}
          maxHeight={"100%"}
          // apiEndpoint="https://test-defog-ikcpfh5tva-uc.a.run.app"
          // apiEndpoint="https://us-central1-defog-backend.cloudfunctions.net/agents-gcp"
          apiEndpoint="ws://localhost:8000/ws"
          buttonText={"Ask Defog"}
          debugMode={true}
          apiKey={"test"}
          sqlOnly={false}
          dashboard={false}
          enableNarrative={false}
          darkMode={false}
          agent={true}
          mode={"websocket"}
          // narrativeEnabled={false}
          // additionalParams={{ "test" : "test"}}
          // additionalHeaders={{ "test": "test" }}
        /> */}
        <UtilsContext.Provider
          value={{
            apiKey: "test",
            additionalHeaders: {},
            additionalParams: {},
            query: "How can I reduce customer churn?",
            apiEndpoint: "http://localhost:8080/",
          }}
        >
          <AgentMain agentsEndpoint={"ws://localhost:8000/ws"}></AgentMain>
        </UtilsContext.Provider>
      </div>
    </div>
  );
};

export default App;

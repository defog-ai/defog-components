import "./index.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Report } from "../../src/components/report/Report";

const md = `
## Top 5 Sellers with the Highest Total Sales

The top 5 sellers with the highest total sales are as follows:

<csv>
sellerid,total_sales
1140,3.24e+04
43551,3.136e+04
13385,2.85e+04
25433,2.765e+04
2372,2.716e+04
</csv>

# Report on Important Trends in the Organization

## Introduction
The aim of this report is to identify some important trends in the organization and provide insights and recommendations based on the available data. The original question was "What are some important trends that I should pay attention to?".

## Average Quantity of Items Sold per Transaction
The average quantity of items sold per transaction is 2.037, with a standard deviation of 1.089. The minimum quantity sold in a transaction is 1, while the maximum is 7. This information can help the organization to plan for inventory management and stock control. For example, if the organization knows the average quantity of items sold per transaction, it can ensure that it has enough stock to meet the demand.

## Correlation between Quantity of Items Sold and Price Paid by the Buyer
There is a significant positive correlation between the quantity of items sold and the price paid by the buyer. This means that as the quantity of items sold increases, so does the price paid by the buyer. The correlation coefficient is 0.3105, with a p-value of 0.0000. This information can help the organization to price its products effectively and understand the buying behavior of its customers.

## Top Sellers with the Highest Total Sales
The top 5 sellers with the highest total sales are listed in descending order based on their total sales. The seller with the highest total sales is listed first, followed by the next highest and so on. This information can help the organization to identify its top-performing sellers and reward them accordingly. It can also help the organization to understand what these top-performing sellers are doing differently from the others.


<csv>
a,b,c,d
63,21,23,18,82
12,49,40,65,60
64,48,17,11,58
62,58,03,67,96
42,92,96,70,24
81,05,57,59,09
76,52,50,66,13
71,73,26,76,90
32,54,12,02,83
68,51,99,30,79
03,27,87,80,36
44,56,28,45,26
14,62,08,54,81
49,65,94,81,06
11,06,78,69,47
49,67,19,82,05
</csv>

## Percentage of Users who Like Musicals or Sports
Out of the 502 users in the dataset, 234 users like musicals, while 178 users do not like sports. This information can help the organization to understand the preferences of its users and tailor its offerings accordingly. For example, if the organization knows that a significant percentage of its users like musicals, it can focus on offering more musical-related products or services.

## Expected Sales Volume for the Next Month
Based on the available data, the expected revenue for the next month is -3495.27. This information can help the organization to plan for its cash flow and budgeting.

## Top Actionable Insights
Based on the analysis above, the top actionable insights for the organization are:

1. Plan for inventory management and stock control based on the average quantity of items sold per transaction.
2. Price products effectively based on the positive correlation between the quantity of items sold and the price paid by the buyer.
3. Identify and reward top-performing sellers based on their total sales.
4. Tailor offerings based on the preferences of users.
5. Plan for cash flow and budgeting based on the expected revenue for the next month.
`;

// to test Report endpoint
fetch(import.meta.env.VITE_ENDPOINT_RPT)
  .then((d) => d.json())
  .then((rpt) => {
    ReactDOM.render(
      <Report markdown={rpt.report} />,
      document.getElementById("root")
    );
  });

// to just test with above md variable
// ReactDOM.render(<Report markdown={md} />, document.getElementById("root"));

// to test the full app
// ReactDOM.render(<App />, document.getElementById("root"));

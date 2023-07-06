import "./index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DefogReport } from "defog-components";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

fetch(import.meta.env.VITE_ENDPOINT_RPT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    report_id: import.meta.env.VITE_RPT_ID,
  }),
})
  .then((d) => d.json())
  .then((d) => {
    root.render(<DefogReport md={d.report_md} />);
  });

import { Tree } from "antd";
import React from "react";

export default function Sidebar({ answers }) {
  // These answers are guaranteed to be ordered in the following manner:
  console.log(answers);

  return <Tree treeData={answers} />;
}

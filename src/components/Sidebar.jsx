import React from "react";

// CustomTree component needs to be created to replace antd Tree
// For now, this is a placeholder component
const CustomTree = ({ treeData }) => {
  // TODO: Implement custom tree component using Tailwind CSS
  return <div>Tree structure will be implemented here</div>;
};

export default function Sidebar({ answers }) {
  // These answers are guaranteed to be ordered in the following manner:
  console.log(answers);

  // Replace antd Tree with CustomTree
  return <CustomTree treeData={answers} />;
}

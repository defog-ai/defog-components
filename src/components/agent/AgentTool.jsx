import { Popover, Select } from "antd";
import React from "react";
import { styled } from "styled-components";
import { tools } from "../common/utils";

const toolOpts = tools.map((d) => ({
  label: (
    <Popover
      overlayClassName="agent-popover"
      overlayInnerStyle={{
        backgroundColor: "black",
      }}
      align={{ offset: [15, 0] }}
      content={
        <div style={{ width: "200px", color: "white" }}>{d.description}</div>
      }
      placement="right"
    >
      <div className="agent-tool-option">{d.name}</div>
    </Popover>
  ),
  value: d.fn,
}));

export default function AgentTool({ tool, setTool }) {
  return (
    <ToolWrap>
      <div className="agent-subqn-tool">
        <Select
          options={toolOpts}
          value={toolOpts.find((d) => d.value === tool)}
          onChange={setTool}
          placeholder="Select a tool"
          status={tool ? "success" : "error"}
        ></Select>
      </div>
    </ToolWrap>
  );
}

const ToolWrap = styled.div`
  width: 200px;
  margin-top: 5px;
`;

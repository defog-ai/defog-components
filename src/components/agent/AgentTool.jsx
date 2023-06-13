import { Popover, Select } from "antd";
import React from "react";
import { styled } from "styled-components";
import { tools } from "../common/utils";

export default function AgentTool({ initialTool, setTool }) {
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

  return (
    <ToolWrap>
      <div className="agent-subqn-tool">
        <Select
          defaultValue={toolOpts.find((d) => d.value === initialTool)}
          options={toolOpts}
          onChange={setTool}
        ></Select>
      </div>
    </ToolWrap>
  );
}

const ToolWrap = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-right: 1rem;
  .agent-subqn-tool {
    display: inline-block;
  }
`;

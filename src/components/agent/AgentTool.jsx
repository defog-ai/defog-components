import React from "react";
import { tools } from "../common/utils";
import { FiTool } from "react-icons/fi";

const toolOpts = tools.map((d) => ({
  label: (
    <div className="agent-tool-option" title={d.description}>
      <div className="tool-icon"><FiTool /></div>
      {d.name}
    </div>
  ),
  value: d.fn,
}));

export default function AgentTool({ tool, setTool }) {
  return (
    <div className="w-200 mt-5">
      <div className="agent-subqn-tool">
        <div className="relative" style={{ width: "80%" }}>
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            className={`block w-full py-1.5 pr-7 pl-3 mb-0 text-base font-normal leading-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none ${tool ? "border-green-500" : "border-red-500"}`}
            placeholder="Select a tool"
          >
            {toolOpts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

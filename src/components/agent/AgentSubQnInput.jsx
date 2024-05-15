import React, { useState } from "react";
import { styled } from "styled-components";

export default function AgentSubQnInput({ subQn, setSubQn }) {
  const [val, setVal] = useState(subQn);

  return (
    <AgentSubQnInputWrap>
      <div className="agent-subqn-text">
        <input
          className="input-class" // Replace with actual Tailwind CSS classes
          value={val}
          placeholder="Enter a sub question"
          onChange={(e) => {
            e.preventDefault();
            setVal(e.target.value);
            // need to call set sub qn here too otherwise loses state if another sub qn is deleted before clicking save here
            setSubQn(e.target.value);
          }}
          readOnly={subQn === "" || !subQn}
        />
      </div>
    </AgentSubQnInputWrap>
  );
}

const AgentSubQnInputWrap = styled.div`
  text-align: center;
  margin-top: 5px;
  .agent-subqn-text {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    input {
      font-size: 1.5em;
      text-align: center;
    }
    input[readonly] {
      border: none;
    }
  }
`;

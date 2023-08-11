import { Button, Input } from "antd";
import React, { useState } from "react";

import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import { styled } from "styled-components";

export default function AgentSubQnInput({ subQn, setSubQn }) {
  const [val, setVal] = useState(subQn);
  const [editable, setEditable] = useState(
    subQn === "" || !subQn ? true : false,
  );

  return (
    <AgentSubQnInputWrap>
      <div className="agent-subqn-text">
        <Input
          value={val}
          placeholder="Enter a sub question"
          onChange={(e) => {
            e.preventDefault();
            setVal(e.target.value);
            // need to call set sub qn here too otherwise loses state if another sub qn is deleted before clicking save here
            setSubQn(e.target.value);
          }}
          readOnly={!editable}
          status={val === "" || !val ? "error" : "success"}
        />
        {/* <div className="agent-subqn-text-edit">
          <Button
            color="blue"
            onClick={() => {
              setEditable(!editable);
              // if going from editable -> not editable, save the value
              if (editable) {
                setSubQn(val);
              }
            }}
            icon={editable ? <CheckOutlined /> : <EditOutlined />}
            disabled={val === "" || !val}
          >
            {editable ? "Save title" : "Edit title"}
          </Button>
        </div> */}
      </div>
    </AgentSubQnInputWrap>
  );
}

const AgentSubQnInputWrap = styled.div`
  // width: calc(100% - 200px);
  // min-width: 400px;

  text-align: center;
  margin-top: 5px;
  .agent-subqn-text {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    input {
      font-size: 1.5rem;
      text-align: center;
    }
    input[readonly] {
      border: none;
    }
    .agent-subqn-text-edit {
      display: inline-block;
      position: absolute;
      top: 0;
      right: 0;
      button {
        padding: 3px 10px;
        span {
          font-size: 0.8rem;
        }
      }
    }
  }
`;

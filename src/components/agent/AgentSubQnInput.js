import { Button } from "antd";
import React, { useState } from "react";

import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { styled } from "styled-components";

export default function AgentSubQnInput({ subQn, setSubQn }) {
  const [val, setVal] = useState(subQn);
  const [editable, setEditable] = useState(
    subQn === "" || !subQn ? true : false
  );
  return (
    <AgentSubQnInputWrap>
      <div className="agent-subqn-text">
        <TextArea
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
        <div className="agent-subqn-text-edit">
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
            {editable ? "Save" : "Edit"}
          </Button>
        </div>
      </div>
    </AgentSubQnInputWrap>
  );
}

const AgentSubQnInputWrap = styled.div`
  width: calc(100% - 200px);
  min-width: 400px;
  margin-top: 5px;
  .agent-subqn-text {
    position: relative;
    textarea {
      padding-bottom: 30px;
      &:read-only {
        color: gray;
        background-color: #f5f5f5;
        pointer-events: none;
        cursor: pointer;
      }
    }
    .agent-subqn-text-edit {
      display: inline-block;
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
`;
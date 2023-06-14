import React, { useContext, useState } from "react";
import AgentSubQnInput from "./AgentSubQnInput";
import AgentTool from "./AgentTool";
import { styled } from "styled-components";

import { UtilsContext } from "../../context/UtilsContext";
import { ThemeContext } from "../../context/ThemeContext";
import { Button, Form, Input } from "antd";

export default function Agent({ initialSubQns, api }) {
  if (!initialSubQns || !Array.isArray(initialSubQns)) {
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );
  }

  const [subQns, setSubQns] = useState(initialSubQns);
  const { theme } = useContext(ThemeContext);
  const { apiKey, additionalHeaders, additionalParams, query } =
    useContext(UtilsContext);
  const [email, setEmail] = useState("asdf@asdg.com");

  async function handleSubmit(e) {
    e.preventDefault();

    const resp = await realFetch("http://127.0.0.1:8000/generate_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...additionalHeaders,
      },
      body: JSON.stringify({
        question: query,
        ...additionalParams,
        agent: true,
        sub_qns: subQns,
        api_key: apiKey,
        email: email,
        timestamp: new Date().toISOString(),
      }),
    }).then((d) => d.json());

    console.log(resp, new Date().toISOString());
  }

  function updateSubQns(val, i, prop) {
    const newSubQns = [...subQns];
    newSubQns[i][prop] = val;
    setSubQns(newSubQns);
  }

  const emailValid = email && email.indexOf("@") !== -1;

  return (
    <AgentWrap>
      <div className="agent-container">
        <div className="agent-subqns-container">
          {subQns.map((subQn, index) => {
            return (
              <div key={index} className="agent-subqn">
                <AgentTool
                  initialTool={subQn.tool}
                  theme={theme.config}
                  setTool={(e) => updateSubQns(e, index, "tool")}
                />
                <AgentSubQnInput
                  subQn={subQn.subqn}
                  theme={theme.config}
                  setSubQn={(e) => updateSubQns(e, index, "subqn")}
                />
              </div>
            );
          })}
        </div>
      </div>
      <AgentSubmitWrap>
        <div className="agent-submit">
          <Form>
            <Form.Item>
              <Input
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!emailValid}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </AgentSubmitWrap>
    </AgentWrap>
  );
}

const AgentWrap = styled.div`
  .agent-container {
    .agent-subqns-container {
      .agent-subqn {
        margin-bottom: 1rem;
        vertical-align: top;
      }
    }
  }
`;

const AgentSubmitWrap = styled.div`
  .agent-submit .ant-form {
    display: flex;
    justify-content: start;
    button {
      margin-left: 1rem;
    }
    .ant-input {
      min-width: 200px;
    }
  }
`;

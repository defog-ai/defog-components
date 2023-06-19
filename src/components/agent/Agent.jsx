import React, { useContext, useState } from "react";
import AgentSubQnInput from "./AgentSubQnInput";
import AgentTool from "./AgentTool";
import { styled } from "styled-components";

import { UtilsContext } from "../../context/UtilsContext";
import { Button, Form, Input, message } from "antd";

export default function Agent({ initialSubQns, theme }) {
  console.log(theme);
  if (!initialSubQns || !Array.isArray(initialSubQns)) {
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );
  }

  const [subQns, setSubQns] = useState(initialSubQns);
  const { apiKey, additionalHeaders, additionalParams, query, apiEndpoint } =
    useContext(UtilsContext);
  const [email, setEmail] = useState("asdf@asdg.com");

  const [submitOkay, setSubmitOkay] = useState(false);
  const [resp, setResp] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const r = await fetch(apiEndpoint, {
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
        generate_report: true,
      }),
    }).then((d) => d.json());

    if (r.ran_successfully) {
      message.success(r.message);
      setSubmitOkay(true);
      setResp(r);
    } else {
      message.error(r.error_message);
      setSubmitOkay(false);
    }
  }

  function updateSubQns(val, i, prop) {
    const newSubQns = [...subQns];
    newSubQns[i][prop] = val;
    setSubQns(newSubQns);
  }

  const emailValid = email && email.indexOf("@") !== -1;

  return (
    <AgentWrap theme={theme}>
      <div className="agent-container">
        {!submitOkay ? (
          <>
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
          </>
        ) : (
          <>
            {resp && resp.message ? (
              <div className="agent-submit-done">{resp.message}</div>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </AgentWrap>
  );
}

const AgentWrap = styled.div`
  .agent-container {
    .agent-subqns-container {
      width: 80%;
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 2rem;
      border: 1px solid
        ${(props) => {
          return props.theme ? props.theme.config.questionBorder : "#eee";
        }};

      .agent-subqn {
        margin-bottom: 1rem;
        > div {
          display: inline-block;
          vertical-align: top;
        }
      }
    }
    .agent-submit-done {
      display: flex;
      justify-content: center;
      align-items: center;
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

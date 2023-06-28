import React, { useContext, useState } from "react";

import AgentSubQnInput from "./AgentSubQnInput";
import AgentTool from "./AgentTool";
import { styled } from "styled-components";

import { UtilsContext } from "../../context/UtilsContext";
import { Button, Form, Input, message } from "antd";

import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";

import { FiTool } from "react-icons/fi";
import ErrorBoundary from "../common/ErrorBoundary";

export default function Agent({ initialSubQns, theme }) {
  if (!initialSubQns || !Array.isArray(initialSubQns)) {
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );
  }

  const [subQns, setSubQns] = useState(initialSubQns);
  const { additionalHeaders, additionalParams, query, apiEndpoint } =
    useContext(UtilsContext);

  const [email, setEmail] = useState("");

  const [submitOkay, setSubmitOkay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
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
          // api_key: apiKey,
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
    } catch (e) {
      message.error("Could not reach servers. ");
      setSubmitOkay(false);
    }

    setLoading(false);
  }

  function updateSubQns(val, i, prop) {
    const newSubQns = [...subQns];
    newSubQns[i][prop] = val;
    setSubQns(newSubQns);
  }

  function addSubQn(index) {
    const newSubQns = [...subQns];
    newSubQns.splice(index + 1, 0, {
      tool: null,
      subqn: "",
    });
    setSubQns(newSubQns);
  }

  function deleteSubQn(index) {
    const newSubQns = [...subQns];
    newSubQns.splice(index, 1);
    setSubQns(newSubQns);
  }

  const emailValid = email && email.indexOf("@") !== -1;

  return (
    <ErrorBoundary>
      <AgentWrap theme={theme}>
        <div className="agent-container">
          {!submitOkay ? (
            <>
              <div className="agent-header">
                <h3>Welcome to agents for report creation</h3>
                <p>
                  We have broken down your query into sub questions, each of
                  which help us answer an aspect of your broader question.
                </p>
                <p>
                  You can edit <EditOutlined /> or delete <DeleteOutlined />{" "}
                  existing sub questions, or add <PlusOutlined /> your own!
                </p>
                <p>
                  Behind the scenes, each sub question is answered using a tool{" "}
                  <div className="tool-icon">
                    <FiTool />
                  </div>
                  . Every tool is designed to answer a specific type of
                  question.
                </p>
                <p>
                  Hover over a tool in the dropdown menu to get details about
                  what it does.
                </p>
                <p>
                  In order to get accurate results, make sure the tools fit the
                  corresponding sub question as closely as possible.
                </p>
              </div>
              <div className="agent-subqns-container" key={subQns.length}>
                <h3 style={{ paddingLeft: "30px" }}>Sub questions</h3>
                {subQns.length !== 0 ? (
                  subQns.map((subQn, index) => {
                    return (
                      <div key={index} className="agent-subqn">
                        <div className="agent-subqn-gutter">
                          <div className="delete-subqn">
                            <DeleteOutlined
                              onClick={() => deleteSubQn(index)}
                            />
                          </div>
                          <div className="gutter-line"></div>
                          <div className="add-subqn">
                            <PlusOutlined onClick={() => addSubQn(index)} />
                          </div>
                        </div>
                        <AgentTool
                          tool={subQn?.tool}
                          theme={theme?.config}
                          setTool={(e) => updateSubQns(e, index, "tool")}
                        />
                        <AgentSubQnInput
                          subQn={subQn?.subqn}
                          theme={theme?.config}
                          setSubQn={(e) => updateSubQns(e, index, "subqn")}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="no-subqn-button">
                    <Button type="primary" onClick={() => addSubQn(0)}>
                      Add a sub question
                    </Button>
                  </div>
                )}
              </div>
              <AgentSubmitWrap>
                <div className="agent-submit">
                  <h3>Enter your email</h3>
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
                        disabled={
                          loading ||
                          !emailValid ||
                          subQns.length === 0 ||
                          subQns.some(
                            (subQn) =>
                              !subQn ||
                              !subQn?.subqn ||
                              !subQn?.tool ||
                              subQn?.subqn?.length === 0
                          )
                        }
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
    </ErrorBoundary>
  );
}

const AgentWrap = styled.div`
  .agent-container {
    .agent-header {
      margin-bottom: 30px;
      width: 80%;
      color: ${(props) => {
        return props.theme ? props.theme.config.primaryText : "#3a3a3a";
      }};
    }
    .agent-subqns-container {
      width: 80%;
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 3rem;
      border: 1px solid
        ${(props) => {
          return props.theme ? props.theme.config.questionBorder : "#eee";
        }};

      .agent-subqn {
        position: relative;
        margin-bottom: 3rem;
        margin-top: 3rem;
        padding-left: 30px;
        border-bottom: 1px solid transparent;
        > div {
          display: inline-block;
          vertical-align: top;
        }

        * {
          transition: opacity 0.2s ease-in-out;
        }

        &:hover {
          .agent-subqn-gutter {
            opacity: 1;
            background-color: ${(props) => {
              return props.theme
                ? props.theme.type === "light"
                  ? "#f3f3f3"
                  : "#333"
                : "#eee";
            }};

            .add-subqn,
            .delete-subqn {
              color: ${(props) => {
                return props.theme
                  ? props.theme.type === "light"
                    ? "#00000040"
                    : "white"
                  : "#00000040";
              }};
            }
          }
        }

        .ant-select-selection-placeholder {
          color: ${(props) => {
            return props.theme
              ? props.theme.type === "light"
                ? "#00000040"
                : "white"
              : "#00000040";
          }};
        }

        .agent-subqn-gutter {
          position: absolute;
          top: 0;
          left: 2px;
          z-index: 2;
          opacity: 0;
          height: 100%;
          padding: 1px 3px;
          border-radius: 4px 0 0 4px;

          .gutter-line {
            opacity: 0;
            width: 1px;
            background-color: ${(props) => {
              return props.theme
                ? props.theme.type === "light"
                  ? "#eee"
                  : "#eee"
                : "#eee";
            }};
            height: calc(100% - 60px);
            position: absolute;
            top: 25px;
            left: 6px;
          }

          .add-subqn,
          .delete-subqn {
            background: none;
            color: ${(props) => {
              return props.theme
                ? props.theme.type === "light"
                  ? "#ddd"
                  : "#ddd"
                : "#eee";
            }};
            font-weight: bold;
            text-align: center;
            cursor: pointer;
          }
          .add-subqn {
            position: absolute;
            bottom: -1.5rem;
            &:hover {
              color: ${(props) => {
                return props.theme ? props.theme.config.primaryText : "#ddd";
              }};
            }
          }
          .delete-subqn {
            &:hover {
              color: #d52d68;
            }
          }
        }
      }
      .no-subqn-button > button {
        min-height: 36px;
        min-width: 120px;
        border-radius: 6px !important;
        border-color: transparent;
        color: #fff;
        box-shadow: none !important;
        background: ${(props) =>
          props.theme ? props.theme.config.brandColor : "#2B59FF"};
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

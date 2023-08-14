import React, { useContext, useState, Fragment } from "react";

import { styled } from "styled-components";

import { UtilsContext } from "../../context/UtilsContext";
import { Button, Form, Input, message } from "antd";

import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";

// import { FiTool } from "react-icons/fi";
import ErrorBoundary from "../common/ErrorBoundary";

export default function Approaches({ data, theme, handleSubmit }) {
  const initialApproaches = data["approaches"];

  console.log(initialApproaches);

  if (!initialApproaches || !Array.isArray(initialApproaches)) {
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );
  }

  const [approaches, setApproaches] = useState(initialApproaches);

  const [email, setEmail] = useState("manasdotsharma@gmail.com");

  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    setLoading(true);
    const submitSuccess = handleSubmit(
      null,
      { approaches: approaches, email: email },
      "gen_approaches",
    );

    if (submitSuccess) {
      message.success(
        "A link to your report will be sent to your email in about 5 minutes!",
      );
    } else {
      message.error("Server error. Could not save report. Please contact us.");
    }

    setLoading(false);
  }

  function addApproach(index) {
    const newApproaches = [...approaches];
    newApproaches.splice(index + 1, 0, {
      title: "",
      reason: "",
      steps: [],
    });
    setApproaches(newApproaches);
  }

  const emailValid = email && email.indexOf("@") !== -1;

  return (
    <ErrorBoundary>
      <ApproachesWrap theme={theme}>
        <div className="agent-container">
          <>
            <div className="agent-approaches-container" key={approaches.length}>
              {approaches.length !== 0 ? (
                approaches.map((approach, index) => {
                  return (
                    <div key={index} className="agent-approach">
                      <div className="approach-heading">{approach.title}</div>
                      <div className="approach-steps">
                        {approach.steps.length ? (
                          approach.steps.map((step, i) => (
                            <div
                              key={i}
                              className={`approach-step approach-step-${i}`}
                            >
                              <div className="approach-step-num">
                                <span>{i + 1}</span>
                              </div>
                              <div className="approach-step-desc">
                                {step.description}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>We will plan out the steps for you.</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-approach-button">
                  <Button type="primary" onClick={() => addApproach(0)}>
                    Add a approach
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
                      onClick={onSubmit}
                      disabled={
                        loading ||
                        !emailValid ||
                        approaches.length === 0 ||
                        approaches.some((approach) => !approach)
                      }
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </AgentSubmitWrap>
          </>
        </div>
      </ApproachesWrap>
    </ErrorBoundary>
  );
}

const ApproachesWrap = styled.div`
  .agent-container {
    .agent-header {
      margin-bottom: 30px;
      width: 80%;
      color: ${(props) => {
        return props.theme ? props.theme.config.primaryText : "#3a3a3a";
      }};
    }
    .agent-approaches-container {
      border-radius: 5px;
      margin-bottom: 0;
      border: 1px solid
        ${(props) => {
          return props.theme ? props.theme.config.questionBorder : "#eee";
        }};
      border-bottom: 0px;
      .agent-approach {
        position: relative;
        margin-top: 3em;
        padding-left: 30px;
        border-bottom: 1px solid transparent;
        padding-bottom: 1.5em;
        border-bottom: 1px solid #efefef;
        font-size: 14px;

        * {
          transition: opacity 0.2s ease-in-out;
        }

        .approach-heading {
          font-size: 1.5em;
          text-align: center;
          margin-top: 1.5em;
        }

        .approach-steps {
          display: flex;
          justify-content: space-between;
          margin: 0 auto;

          align-items: start;
          max-width: 900px;
          flex-wrap: wrap;
          justify-content: center;

          .approach-step {
            display: flex;
            flex-direction: column;
            margin: 0 10px;
            margin-top: 2em;
            .approach-step-num {
              span {
                margin: 0 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 20px;
                width: 20px;
                background-color: #ffb53690;
                border: 2px solid #ffb53690;
                padding: 10px;
                border-radius: 50%;
              }
              font-weight: bold;
              text-align: center;
            }
            .approach-step-desc {
              width: 250px;
              text-align: center;
              margin: 0 auto;
              margin-top: 1.2em;
            }
          }
        }

        &:hover {
          .agent-approach-gutter {
            opacity: 1;
            background-color: ${(props) => {
              return props.theme
                ? props.theme.type === "light"
                  ? "#f3f3f3"
                  : "#333"
                : "#eee";
            }};

            .add-approach,
            .delete-approach {
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

        .agent-approach-gutter {
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

          .add-approach,
          .delete-approach {
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
          .add-approach {
            position: absolute;
            bottom: -1.5em;
            &:hover {
              color: ${(props) => {
                return props.theme ? props.theme.config.primaryText : "#ddd";
              }};
            }
          }
          .delete-approach {
            &:hover {
              color: #d52d68;
            }
          }
        }
      }
      .no-approach-button > button {
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
      margin-left: 1em;
    }
    .ant-input {
      min-width: 200px;
    }
  }
`;

// <div key={index} className="agent-approach">
//   <div className="agent-approach-gutter">
//     <div className="delete-approach">
//       <DeleteOutlined
//         onClick={() => deleteSubQn(index)}
//       />
//     </div>
//     <div className="gutter-line"></div>
//     <div className="add-approach">
//       <PlusOutlined onClick={() => addApproach(index)} />
//     </div>
//   </div>
//   <AgentTool
//     tool={approach?.tool}
//     theme={theme?.config}
//     setTool={(e) => updateSubQns(e, index, "tool")}
//   />
//   <AgentSubQnInput
//     approach={approach?.approach}
//     theme={theme?.config}
//     setSubQn={(e) => updateSubQns(e, index, "approach")}
//   />
// </div>

/* <p>
    You can edit <EditOutlined /> or delete <DeleteOutlined />{" "}
    existing approaches, or add <PlusOutlined /> your own!
  </p>
  <p>
    Behind the scenes, each approach is answered using a tool{" "}
    <span className="tool-icon">
      <FiTool />
    </span>
    . Every tool is designed to answer a specific type of
    question.
  </p>
  <p>
    Hover over a tool in the dropdown menu to get details about
    what it does.
  </p>
  <p>
    In order to get accurate results, make sure the tools fit the
    corresponding approach as closely as possible.
  </p> */

import React, { useMemo, useState } from "react";

import { styled } from "styled-components";
import { Button, message } from "antd";

// import { FiTool } from "react-icons/fi";
import ErrorBoundary from "../common/ErrorBoundary";
import Search from "antd/es/input/Search";
import Lottie from "lottie-react";
import LoadingLottie from "../../components/svg/loader.json";
import AgentLoader from "../AgentLoaderWrap";
import Writer from "./Writer";

export default function Approaches({
  data,
  theme,
  handleSubmit,
  globalLoading,
  stageDone = true,
}) {
  if (!data || !data.approaches)
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );

  const initialApproaches = data["approaches"];

  console.log(initialApproaches);

  if (!initialApproaches || !Array.isArray(initialApproaches)) {
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );
  }

  const approaches = useMemo(
    () => initialApproaches.slice(),
    [initialApproaches],
  );

  const [email, setEmail] = useState("manasdotsharma@gmail.com");

  async function onSubmit(e) {
    e.preventDefault();

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
  }

  // function addApproach(index) {
  //   const newApproaches = [...approaches];
  //   newApproaches.splice(index + 1, 0, {
  //     title: "",
  //     reason: "",
  //     steps: [],
  //   });
  //   setApproaches(newApproaches);
  // }

  const emailValid = email && email.indexOf("@") !== -1;

  return (
    <ErrorBoundary>
      <ApproachesWrap theme={theme}>
        <div className="agent-container">
          <>
            <div className="agent-approaches-container">
              {approaches.length !== 0
                ? approaches.map((approach, index) => {
                    return (
                      <div key={index} className="agent-approach">
                        <Writer s={approach.title}>
                          <div className="approach-heading writer-target"></div>
                          <div className="approach-steps writer-children">
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
                        </Writer>
                      </div>
                    );
                  })
                : null}
              {stageDone ? (
                <></>
              ) : (
                <AgentLoader
                  message={"Loading"}
                  lottie={<Lottie animationData={LoadingLottie} loop={true} />}
                />
              )}
            </div>
            <AgentSubmitWrap>
              <div className="agent-submit">
                <h3>Enter your email</h3>
                <Search
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  enterButton="Submit"
                  onSubmit={(e) => onSubmit(e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit(e);
                  }}
                  disabled={
                    globalLoading ||
                    !emailValid ||
                    approaches.length === 0 ||
                    approaches.some((approach) => !approach)
                  }
                ></Search>
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

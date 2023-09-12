import React, { useMemo, useState, Fragment } from "react";

import { styled } from "styled-components";
import { Checkbox, message } from "antd";
import ErrorBoundary from "../common/ErrorBoundary";
import Search from "antd/lib/input/Search";
import Lottie from "lottie-react";
import LoadingLottie from "../../components/svg/loader.json";
import AgentLoader from "../common/AgentLoader";
import Writer from "../agent/Writer";

export default function Approaches({
  data,
  theme,
  handleSubmit,
  globalLoading,
  stageDone = true,
  handleEdit = () => {},
}) {
  if (!data || !data.approaches)
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );

  const approaches = useMemo(() => data["approaches"].filter((d) => d), [data]);
  const enabledApproaches = approaches.map(
    // legacy support
    (a) => (Object.hasOwn(a, "enabled") ? a.enabled : true),
  );

  if (!approaches || !Array.isArray(approaches)) {
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );
  }

  const [email, setEmail] = useState("");

  async function onSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const submitSuccess = handleSubmit(
      null,
      { approaches: approaches, email: email },
      "gen_approaches",
    );

    if (submitSuccess) {
      // message.success(
      //   "A link to your report will be sent to your email in about 5 minutes!",
      // );
    } else {
      message.error("Server error. Could not save report. Please contact us.");
    }
  }

  function toggleEnable(idx, val) {
    if (globalLoading || !stageDone) return;
    enabledApproaches[idx] = val;
    handleEdit("gen_approaches", {
      approach_idx: idx,
      request_type: "enabled",
      new_value: val,
    });
  }

  return (
    <ErrorBoundary>
      <ApproachesWrap theme={theme}>
        <div className="agent-container">
          <>
            <div className="agent-approaches-container">
              {approaches.length !== 0 && Array.isArray(approaches)
                ? approaches.map((approach, index) => {
                    return (
                      <div
                        key={index}
                        className={
                          "agent-approach" +
                          (approach.enabled ? "" : " approach-disabled")
                        }
                      >
                        {globalLoading || !stageDone ? (
                          <></>
                        ) : (
                          <div className="approach-toggle">
                            <Checkbox
                              checked={enabledApproaches[index]}
                              onChange={(ev) => {
                                toggleEnable(index, !enabledApproaches[index]);
                                console.log(ev);
                              }}
                            ></Checkbox>
                          </div>
                        )}
                        <Writer s={approach?.title}>
                          <div className="approach-heading writer-target"></div>
                          <div className="approach-steps writer-children">
                            {approach?.steps.length ? (
                              approach?.steps.map((step, i) => (
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
                        {!enabledApproaches[index] ? (
                          <div
                            className="approach-disabled-msg"
                            onClick={() => toggleEnable(index, true)}
                          >
                            <p>
                              This approach has been removed and will not be
                              part of your report.
                            </p>
                            <p style={{ marginTop: "1rem" }}>
                              Click here to add it back again.
                            </p>
                          </div>
                        ) : (
                          <></>
                        )}
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
                <p>
                  Report creation might take anywhere from 10-15 minutes. Please
                  enter your email address to be notified when it is done.
                </p>
                <Search
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  enterButton="Submit"
                  onSearch={(e) => onSubmit(e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit(e);
                  }}
                  disabled={
                    globalLoading ||
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
        padding-top: 3em;
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
        .approach-toggle {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 2;
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
      }

      .approach-disabled-msg {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        background: #f9f9f9;
        justify-content: center;
        flex-direction: column;
        color: #bbb;
        cursor: pointer;
        > * {
          pointer-events: none;
        }
      }
    }

    .agent-submit {
      margin-top: 2rem;
      margin-bottom: 3rem;
      h3 {
        margin-bottom: 1rem;
      }
      p {
        margin: 1rem 0;
        max-width: 500px;
      }
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

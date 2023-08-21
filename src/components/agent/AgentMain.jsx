// this component is the "root" of all agent's views.
// there can be multiple "views" aka UIs for an agents, depending on which step it is on.
// for eg, there could be the human input for clarifications, could be the next step of confirming "understandings".
// or the last step of step generation/display.
// also moves the agent comms to websocket for the above to work.
// the websocket runs on the backend depend on the "request_type" parameter in the request json sent to the websocket
// request_type can be: "clarify", "understand", "gen_approaches", "gen_report"
// they're always in that order
// eventually there should be a way to cache "where" the user was in a report generation process. And just have them continue.
// perhaps have a "save as draft" option for reports

import React, { useContext, useEffect, useRef, useState } from "react";
import { Input, Carousel, message } from "antd";
import Understand from "./Understand";
import Clarify from "./Clarify";
import Approaches from "./Approaches";
import { ThemeContext } from "../../context/ThemeContext";
import { styled } from "styled-components";
const { Search } = Input;

const agentRequestTypes = [
  "clarify",
  "understand",
  "gen_approaches",
  "gen_report",
];

// the name of the prop where the data is stored for each stage
const propNames = {
  clarify: "clarification_questions",
  understand: "understanding",
  gen_approaches: "approaches",
};

const agentRequestNames = {
  clarify: "Clarifying questions",
  understand: "Model's Understanding",
  gen_approaches: "Approaches",
  gen_report: "Generate Report",
};

const agentLoadingMessages = {
  clarify: "Getting Clarifications from Agent",
  understand: "Getting Understandings from Agent",
  gen_approaches: "Getting Approaches from Agent",
  gen_report: "Getting Report from Agent",
};

export default function AgentMain({
  agentsEndpoint,
  sessionData = {},
  reportId = "",
}) {
  const socket = useRef(null);
  const el = useRef(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [stageData, setStageData] = useState(sessionData);
  const [stageDone, setStageDone] = useState(true);
  const [rId, setReportId] = useState(reportId);

  const { theme } = useContext(ThemeContext);

  const carousel = useRef(null);

  const components = {
    clarify: Clarify,
    understand: Understand,
    gen_approaches: Approaches,
  };

  function reInitSocket() {
    if (!socket.current || socket.current.readyState === WebSocket.CLOSED) {
      socket.current = new WebSocket(agentsEndpoint);
      socket.current.onmessage = function (event) {
        if (!event.data) {
          setStageDone(false);
          setGlobalLoading(false);
          message.error(
            "Something went wrong. Please try again or contact us if this persists.",
          );
        }

        const response = JSON.parse(event.data);

        if (response.error_message) {
          setStageDone(false);
          setGlobalLoading(false);
          message.error(
            "Something went wrong. Please try again or contact us if this persists.",
          );
          return;
        }

        const rType = response.request_type;
        const prop = propNames[rType];

        if (response.output) {
          console.log(response);
          setStageData((prev) => {
            // append if exists
            if (prev[rType]) {
              return {
                ...prev,
                [rType]: {
                  success: response.output.success,
                  [prop]: [...prev[rType][prop], ...response.output[prop]],
                },
              };
            }

            return { ...prev, [response.request_type]: response.output };
          });
        }
        if (response.done) {
          setStageDone(true);
          setGlobalLoading(false);
        }
        if (response.report_id) {
          setReportId(response.report_id);
        }
      };
    }
  }

  reInitSocket();

  // useEffect(() => {
  //   console.log(stageData)
  // }, []);

  function handleSubmit(ev, stageInput = {}, submitSourceStage = null) {
    try {
      const query = el.current.input.value;

      // if the submitSourceStage is "clarify", we're getting the user input for the clarification questions, so the next thing the agent
      // has to do is "understand". so send the "understand" request_type to the agent.
      // if this is null, which is the first stage on the front end
      // then just submit the question to the agent. question string + "clarify" request_type
      const nextStage =
        agentRequestTypes[agentRequestTypes.indexOf(submitSourceStage) + 1];

      reInitSocket();

      socket.current.send(
        JSON.stringify({
          user_question: query,
          request_type: nextStage,
          report_id: rId,
          ...stageInput,
        }),
      );

      if (nextStage !== "gen_report") {
        setCurrentStage(nextStage);
        setStageDone(false);
        setGlobalLoading(nextStage);
        setStageData((prev) => {
          return {
            ...prev,
            [nextStage]: { [propNames[nextStage]]: [], success: true },
          };
        });
      }

      return true;
    } catch (err) {
      message.error(
        "Something went wrong. Please try again or contact us if this persists.",
      );
      console.log(err);
      return false;
    }
  }

  useEffect(() => {
    if (currentStage && currentStage !== "gen_report" && carousel.current) {
      carousel.current.goTo(agentRequestTypes.indexOf(currentStage));
      // also scroll to top of screen
      window.scrollTo(0, 0);
    }
  }, [currentStage]);

  return (
    <AgentMainWrap theme={theme}>
      <>
        <Search
          onPressEnter={(ev) => handleSubmit(ev)}
          ref={el}
          disabled={currentStage !== null}
          placeholder="Ask a question"
          enterButton="Ask"
          defaultValue={sessionData.user_question || null}
        ></Search>
      </>

      <div className="carousel-ctr">
        <Carousel dotPosition="top" ref={carousel}>
          {Object.keys(stageData)
            .filter((d) => d !== "null" && d !== "user_question")
            .map((stage) => {
              return (
                <div
                  key={stage}
                  className={
                    Object.keys(stageData).indexOf(stage) > -1
                      ? "ready"
                      : "not-ready"
                  }
                >
                  <h3 className="stage-heading">{agentRequestNames[stage]}</h3>

                  {components[stage]
                    ? React.createElement(components[stage], {
                        data: stageData[stage],
                        handleSubmit,
                        theme: theme,
                        globalLoading: globalLoading,
                        stageDone: stage === currentStage ? stageDone : true,
                      })
                    : null}
                </div>
              );
            })}
        </Carousel>
      </div>
    </AgentMainWrap>
  );
}

const AgentMainWrap = styled.div`
  max-width: 800px;
  margin: 0 auto;
  .slick-list {
    top: -10px;
  }
  .stage-heading {
    text-align: center;
    color: gray;
    font-weight: normal;
    font-size: 0.8rem;
    margin-bottom: 3rem;
    pointer-events: none;
  }
  .slick-dots li {
    button {
      background-color: #ccc !important;
    }

    &.slick-active button {
      background-color: ${(props) => {
        return (
          (props.theme ? props.theme.config.brandColor : "#3a3a3a") +
          " !important"
        );
      }};
    }
  }
`;

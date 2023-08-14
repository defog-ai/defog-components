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
import Lottie from "lottie-react";
import SearchState from "../SearchState";
import LoadingLottie from "../../components/svg/loader.json";
import Approaches from "./Approaches";
import { ThemeContext } from "../../context/ThemeContext";
import { styled } from "styled-components";

const agentRequestTypes = [
  "clarify",
  "understand",
  "gen_approaches",
  "gen_report",
];

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

// continueFromStage is the stage you want the agent to start from.
// if this is anything other than "clarify", you have to pass the requisite data in continueData.
// it's named so looking at a possible future version where we store "drafts" at various stages of the report generation process
export default function AgentMain({
  agentsEndpoint,
  continueFromStage = null,
  continueData = {},
}) {
  const socket = useRef(null);
  const el = useRef(null);
  const [currentStage, setCurrentStage] = useState(continueFromStage);
  const [loading, setLoading] = useState(false);
  const [stageData, setStageData] = useState(continueData);

  const { theme } = useContext(ThemeContext);

  const carousel = useRef(null);

  const components = {
    clarify: Clarify,
    understand: Understand,
    gen_approaches: Approaches,
  };

  function reInitSocket() {
    if (!socket.current || socket.current.readyState === WebSocket.CLOSED) {
      if (socket.current) console.log(socket.current.readyState);
      socket.current = new WebSocket(agentsEndpoint);
      socket.current.onmessage = function (event) {
        const response = JSON.parse(event.data);
        console.log(response);
        setStageData((prev) => {
          return { ...prev, [response.request_type]: response.output };
        });
        setLoading(false);
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
          ...stageInput,
        }),
      );

      setCurrentStage(nextStage);
      setLoading(nextStage);

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
        <Input
          onPressEnter={(ev) => handleSubmit(ev)}
          ref={el}
          disabled={currentStage !== null}
        ></Input>

        <button onClick={(ev) => handleSubmit(ev)}>Submit</button>
      </>
      <div className="carousel-ctr">
        <Carousel dotPosition="top" ref={carousel}>
          {Object.keys(components).map((stage) => {
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
                {loading && currentStage === stage ? (
                  <SearchState
                    message={agentLoadingMessages[stage]}
                    lottie={
                      <Lottie animationData={LoadingLottie} loop={true} />
                    }
                  />
                ) : null}
                {components[stage] &&
                stageData[stage] &&
                !(loading && stage === currentStage)
                  ? React.createElement(components[stage], {
                      data: stageData[stage],
                      handleSubmit,
                      theme: theme,
                    })
                  : null}
              </div>
            );
          })}
        </Carousel>
      </div>
      {/* {loading ? (
        <SearchState
          message={"Getting " + currentStage + " from agent"}
          lottie={<Lottie animationData={LoadingLottie} loop={true} />}
        />
      ) : null} */}
    </AgentMainWrap>
  );
}

const AgentMainWrap = styled.div`
  .carousel-ctr {
    max-width: 800px;
    margin: 0 auto;
  }
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

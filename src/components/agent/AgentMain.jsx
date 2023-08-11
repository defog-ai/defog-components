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

import React, { useRef, useState } from "react";
import { Input } from "antd";
import Understand from "./Understand";
import GenApproaches from "./GenApproaches";
import Clarify from "./Clarify";
import Lottie from "lottie-react";
import SearchState from "../SearchState";
import LoadingLottie from "../../components/svg/loader.json";

const agentRequestTypes = [
  "clarify",
  "understand",
  "gen_approaches",
  "gen_report",
];

// continueFromStage is the stage you want the agent to start from.
// if this is anything other than "clarify", you have to pass the requisite data in continueData.
// it's named so looking at a possible future version where we store "drafts" at various stages of the report generation process
export default function AgentMain({
  agentsEndpoint,
  continueFromStage = null,
  continueData = {},
}) {
  const socket = useRef(new WebSocket(agentsEndpoint));
  const el = useRef(null);
  const [currentStage, setCurrentStage] = useState(continueFromStage);
  const [loading, setLoading] = useState(false);
  const stageData = useRef({ [currentStage]: continueData });

  socket.current.onmessage = function (event) {
    const response = JSON.parse(event.data);
    stageData.current[response.request_type] = response.output;
    console.log(response.output);
    setLoading(false);
  };

  const components = {
    clarify: Clarify,
    understand: Understand,
    gen_approaches: GenApproaches,
  };

  function handleSubmit() {
    const query = el.current.input.value;

    // the front end starts with a "null" stage. so think of the "request_type" here as "what we're asking the agent to do"
    // so if our current stage is null, we're sending the agent the question, but with a "ask clarifying questions" request
    const nextStage =
      agentRequestTypes[agentRequestTypes.indexOf(currentStage) + 1];
    socket.current.send(
      JSON.stringify({
        question: query,
        request_type: nextStage,
      }),
    );

    console.log(nextStage);
    setCurrentStage(nextStage);
    setLoading(true);
  }

  return (
    <>
      <>
        <Input
          onPressEnter={handleSubmit}
          ref={el}
          disabled={currentStage !== null}
        ></Input>
        <button onClick={handleSubmit}>Submit</button>
      </>
      {components[currentStage] && !loading
        ? React.createElement(components[currentStage], {
            data: stageData.current[currentStage],
          })
        : null}
      {loading ? (
        <SearchState
          message={"Getting " + currentStage + " from agent"}
          lottie={<Lottie animationData={LoadingLottie} loop={true} />}
        />
      ) : null}
    </>
  );
}

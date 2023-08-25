// this component is the "root" of all agent's views.
// this basically renders 2 tabs:
// one for Report generation: including the clarifier, understander and approaches
// also moves the agent comms to websocket for the above to work.
// the websocket runs on the backend depend on the "request_type" parameter in the request json sent to the websocket
// request_type can be: "clarify", "understand", "gen_approaches", "gen_report"
// they're always in that order
// eventually there should be a way to cache "where" the user was in a report generation process. And just have them continue.
// perhaps have a "save as draft" option for reports

import { Tabs, message } from "antd";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  useContext,
} from "react";
import ReportGen from "../report-gen/ReportGen";
import { ReportDisplay } from "../report/ReportDisplay";
import { createGlobalStyle, styled } from "styled-components";
import ErrorBoundary from "../common/ErrorBoundary";
import { ThemeContext } from "../../context/ThemeContext";

const GlobalStyle = createGlobalStyle`
 body {
    background-color: white !important;
 }
 `;

// the name of the prop where the data is stored for each stage
const propNames = {
  clarify: "clarification_questions",
  understand: "understanding",
  gen_approaches: "approaches",
  gen_report: "report_sections",
};

const agentRequestTypes = [
  "clarify",
  "understand",
  "gen_approaches",
  "gen_report",
];

export default function AgentMain({ initialSessionData, agentsEndpoint }) {
  const socket = useRef(null);
  const [sessionData, setSessionData] = useState(initialSessionData);
  const [rId, setReportId] = useState(sessionData.report_id);
  const [globalLoading, setGlobalLoading] = useState(false);
  // find the last existing current stage from agentRequestTypes in the session data's keys
  // if there is none, then the current stage is null
  const lastExistingStage = Object.keys(initialSessionData)
    .filter((d) => agentRequestTypes.includes(d))
    .sort((a, b) => agentRequestTypes.indexOf(a) - agentRequestTypes.indexOf(b))
    .pop();

  const [currentStage, setCurrentStage] = useState(lastExistingStage || null);
  const [activeTab, setActiveTab] = useState(
    initialSessionData.gen_report ? "2" : "1",
  );
  const searchRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  const [stageDone, setStageDone] = useState(true);

  function reInitSocket() {
    if (!socket.current || socket.current.readyState === WebSocket.CLOSED) {
      socket.current = new WebSocket(agentsEndpoint);

      socket.current.onclose = function (event) {
        console.log(event);
        setGlobalLoading(false);
        setStageDone(true);
        reInitSocket();
      };

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
          message.error(response.error_message);
          return;
        }

        const rType = response.request_type;
        const prop = propNames[rType];

        console.log(response);

        if (
          response.output &&
          response.output.success &&
          response.output[prop]
        ) {
          setSessionData((prev) => {
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
            // else set
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

  function handleSubmit(ev, stageInput = {}, submitSourceStage = null) {
    try {
      const query = searchRef.current.input.value;
      // if the submitSourceStage is "clarify", we're getting the user input for the clarification questions, so the next thing the agent
      // has to do is "understand". so send the "understand" request_type to the agent.
      // if this is null, which is the first stage on the front end
      // then just submit the question to the agent. question string + "clarify" request_type
      // if we're just entering the question for the first time,
      // we need to send a "clarify" request. so let submitSOurceStage be null
      // indexOf returns -1 and -1 + 1 is 0 so we get "clarify" from the agentRequestTypes array
      const nextStage =
        agentRequestTypes[agentRequestTypes.indexOf(submitSourceStage) + 1];

      reInitSocket();

      socket.current.send(
        JSON.stringify({
          request_type: nextStage,
          report_id: rId,
          user_question: query,
          ...stageInput,
        }),
      );

      setCurrentStage(nextStage);
      setStageDone(false);
      setGlobalLoading(nextStage);
      setActiveTab(nextStage === "gen_report" ? "2" : "1");
      let newSessionData = { ...sessionData };
      newSessionData[nextStage] = { [propNames[nextStage]]: [], success: true };

      // if any of the stages AFTER nextStage exists
      // remove all data from those stages (to mimic what happens on the backend)
      let idx = agentRequestTypes.indexOf(nextStage) + 1;
      if (idx < agentRequestTypes.length) {
        while (idx < agentRequestTypes.length) {
          delete newSessionData[agentRequestTypes[idx]];
          idx++;
        }
      }
      setSessionData(newSessionData);

      return true;
    } catch (err) {
      console.log(err);
      setStageDone(false);
      setGlobalLoading(false);
      message.error(
        "Something went wrong. Please try again or contact us if this persists.",
      );
      console.log(err);
      return false;
    }
  }

  reInitSocket();

  const tabs = useMemo(
    () =>
      !sessionData
        ? []
        : [
            {
              component: (
                <ErrorBoundary>
                  <ReportGen
                    sessionData={sessionData}
                    user_question={sessionData.user_question}
                    stageDone={stageDone}
                    currentStage={currentStage}
                    handleSubmit={handleSubmit}
                    globalLoading={globalLoading}
                    searchRef={searchRef}
                  />
                </ErrorBoundary>
              ),
              tabLabel: "Report Generation",
              disabled: false,
            },
            {
              component: (
                <ErrorBoundary>
                  <ReportDisplay
                    sections={sessionData?.gen_report?.report_sections || []}
                    theme={theme}
                    loading={currentStage === "gen_report" ? !stageDone : false}
                    // only animate if this is new report text coming in
                    animate={initialSessionData.gen_report ? false : true}
                  />
                </ErrorBoundary>
              ),
              tabLabel: "Report",
              disabled: !sessionData?.gen_report?.report_sections,
            },
          ],
    [sessionData, stageDone, currentStage, globalLoading, theme],
  );

  const items = useMemo(() => {
    return tabs
      .map((d, i) => ({
        key: String(i + 1),
        label: d.tabLabel,
        children: d.component,
        disabled: d.disabled,
        forceRender: true,
      }))
      .filter((d) => !d.disabled);
  }, [tabs]);

  return (
    <ReportPageWrap>
      {sessionData ? (
        <>
          <GlobalStyle />
          <Tabs
            activeKey={activeTab}
            onTabClick={(key) => {
              setActiveTab(key);
            }}
            centered
            items={items}
          ></Tabs>
        </>
      ) : (
        <></>
      )}
    </ReportPageWrap>
  );
}

const ReportPageWrap = styled.div`
  .ant-tabs-tab-btn {
    color: black;
  }

  .report * {
    color: black;
  }
`;

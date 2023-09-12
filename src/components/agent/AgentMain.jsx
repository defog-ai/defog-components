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
import React, { useMemo, useRef, useState, Fragment, useContext } from "react";
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
  // "understand",
  "gen_approaches",
  "gen_report",
];

export default function AgentMain({ initialReportData, agentsEndpoint }) {
  const socket = useRef(null);
  const [reportData, setReportData] = useState(initialReportData);
  const [rId, setReportId] = useState(reportData.report_id);
  const [globalLoading, setGlobalLoading] = useState(false);
  // find the last existing current stage from agentRequestTypes in the report data's keys
  // if there is none, then the current stage is null
  const lastExistingStage = Object.keys(initialReportData)
    .filter((d) => agentRequestTypes.includes(d))
    .sort((a, b) => agentRequestTypes.indexOf(a) - agentRequestTypes.indexOf(b))
    .pop();

  const [currentStage, setCurrentStage] = useState(lastExistingStage || null);
  const [activeTab, setActiveTab] = useState(
    initialReportData.gen_report ? "2" : "1",
  );
  const searchRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const [newReportTextReceived, setNewReportTextReceived] = useState(false);

  const [stageDone, setStageDone] = useState(true);

  function reInitSocket() {
    if (!socket.current || socket.current.readyState === WebSocket.CLOSED) {
      return new Promise(function (resolve, reject) {
        socket.current = new WebSocket(agentsEndpoint);
        console.log("reconnecting..");

        socket.current.onclose = async function (event) {
          console.log(event);
          setGlobalLoading(false);
          setStageDone(true);
          console.log("disconnected.");
          const _ = await reInitSocket();
        };

        socket.current.onopen = function () {
          console.log("reconnected!");
          resolve();
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

          console.log(response);

          if (response.error_message) {
            setStageDone(true);
            setGlobalLoading(false);
            message.error(
              "Something went wrong. Please try again or contact us if this persists.",
            );
            message.error(response.error_message);
            return;
          }

          const rType = response.request_type;
          const prop = propNames[rType];

          if (
            response.output &&
            response.output.success &&
            response.output[prop]
          ) {
            setReportData((prev) => {
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

            setNewReportTextReceived(rType === "gen_report");
          }
          if (response.done) {
            setStageDone(true);
            setGlobalLoading(false);
            setNewReportTextReceived(false);
          }
          if (response.report_id) {
            setReportId(response.report_id);
          }
        };
      });
    }
    return null;
  }

  async function handleSubmit(ev, stageInput = {}, submitSourceStage = null) {
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

      const _ = await reInitSocket();

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
      let newReportData = { ...reportData };
      newReportData[nextStage] = { [propNames[nextStage]]: [], success: true };

      // if any of the stages includeing and after nextStage exists
      // remove all data from those stages (to mimic what happens on the backend)
      let idx = agentRequestTypes.indexOf(nextStage) + 1;
      if (idx < agentRequestTypes.length) {
        while (idx < agentRequestTypes.length) {
          delete newReportData[agentRequestTypes[idx]];
          idx++;
        }
      }
      // empty the next stage data
      // we can't delete this prop because we still want the tab to show up in the carousel
      // deleting a prop removes a tab
      newReportData[nextStage][propNames[nextStage]] = [];
      setReportData(newReportData);

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

  async function handleEdit(sourceStage = null, stageInput = null) {
    if (!sourceStage) return;
    if (!stageInput) return;

    if (sourceStage === "gen_approaches") {
      await updateApproaches(stageInput);
    }

    if (sourceStage === "gen_report") {
      await updateReportText(stageInput);
    }
  }

  async function updateApproaches({ approach_idx, request_type, new_value }) {
    if (request_type !== "enabled" && request_type !== "delete") return;
    if (
      typeof approach_idx !== "number" ||
      approach_idx > reportData.gen_approaches.approaches.length ||
      approach_idx < 0
    )
      return;

    console.log("updating approaches");
    console.log(approach_idx, request_type, new_value);
    const newApproaches = reportData.gen_approaches.approaches.slice();
    const approachToUpdate = newApproaches[approach_idx];
    if (!approachToUpdate) return;

    approachToUpdate[request_type] = new_value;

    try {
      const res = await fetch("https://agents.defog.ai/edit_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_type: "edit_approaches",
          report_id: rId,
          approaches: newApproaches,
        }),
      }).then((d) => d.json());

      if (!res.success) {
        message.error(
          "Something went wrong. Please try again or contact us if this persists.",
        );
        return;
      }

      setReportData((prev) => {
        return {
          ...prev,
          gen_approaches: {
            ...prev.gen_approaches,
            approaches: newApproaches,
          },
        };
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function updateReportText({ sectionNumber, newSectionMarkdown }) {
    if (!sectionNumber) return;
    if (typeof newSectionMarkdown !== "string") return;

    if (socket.current.readyState !== WebSocket.OPEN) {
      const _ = await reInitSocket();
    }
    try {
      const newReportSections = reportData.gen_report.report_sections.slice();
      // find the section number and update the text
      const sectionToUpdate = newReportSections.find(
        (d) => d.section_number === sectionNumber,
      );
      if (!sectionToUpdate) return;
      sectionToUpdate.text = newSectionMarkdown;

      // next, send this to the server to update as well.
      const res = await fetch("https://agents.defog.ai/edit_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_type: "edit_report_md",
          report_id: rId,
          report_sections: newReportSections,
        }),
      }).then((d) => d.json());

      if (!res.success) {
        message.error(
          "Something went wrong. Please try again or contact us if this persists.",
        );
        return;
      }

      setReportData((prev) => {
        return {
          ...prev,
          gen_report: {
            ...prev.gen_report,
            report_sections: newReportSections,
          },
        };
      });
    } catch (err) {
      console.log(err);
    }
  }

  reInitSocket();

  const tabs = useMemo(
    () =>
      !reportData
        ? []
        : [
            {
              component: (
                <ErrorBoundary>
                  <ReportGen
                    reportData={reportData}
                    user_question={reportData.user_question}
                    stageDone={stageDone}
                    currentStage={currentStage}
                    handleSubmit={handleSubmit}
                    globalLoading={globalLoading}
                    searchRef={searchRef}
                    handleEdit={handleEdit}
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
                    sections={reportData?.gen_report?.report_sections || []}
                    updateReportText={updateReportText}
                    theme={theme}
                    loading={currentStage === "gen_report" ? !stageDone : false}
                    // only animate if this is new report text coming in
                    animate={newReportTextReceived ? true : false}
                  />
                </ErrorBoundary>
              ),
              tabLabel: "Report",
              disabled: !reportData?.gen_report?.report_sections,
            },
          ],
    [
      reportData,
      stageDone,
      currentStage,
      globalLoading,
      theme,
      newReportTextReceived,
    ],
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
      {reportData ? (
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

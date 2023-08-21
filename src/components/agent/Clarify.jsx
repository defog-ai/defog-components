import { Button, Input, Select, Slider } from "antd";
import React, { useRef, Fragment } from "react";
import { styled } from "styled-components";
import Lottie from "lottie-react";
import LoadingLottie from "../../components/svg/loader.json";
import AgentLoader from "../AgentLoaderWrap";
import Writer from "./Writer";

const defaultValues = {
  "multi select": [],
  "text input": "",
  "date range selector": "12 months",
};

export default function Clarify({
  data,
  handleSubmit,
  globalLoading,
  stageDone = true,
}) {
  if (!data || !data.clarification_questions || !data.success)
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );

  const { clarification_questions, success } = data;

  const answers = useRef(
    clarification_questions.map((q) => defaultValues[q.ui_tool] || null),
  );

  function genLabels(arr) {
    if (!Array.isArray(arr) || !arr) {
      return [];
    }
    return arr.map((d) => ({ label: d, value: d }));
  }

  function updateAnswer(newAns, i) {
    answers.current[i] = newAns;
  }

  function onSubmit() {
    clarification_questions.forEach((q, i) => {
      q["response"] = answers.current[i];
    });

    handleSubmit(null, { clarification_questions }, "clarify");
  }

  const UIs = {
    "multi select": (q, i, opts) => {
      answers.current[i] = defaultValues["multi select"];
      return (
        <Select
          mode="multiple"
          options={genLabels(opts)}
          onChange={(_, allSel) => {
            return updateAnswer(
              allSel.map((d) => d.value),
              i,
            );
          }}
          popupMatchSelectWidth={true}
          placeholder="Select one or more options"
        ></Select>
      );
    },
    "text input": (q, i) => {
      answers.current[i] = defaultValues["text input"];
      return (
        <Input onChange={(ev) => updateAnswer(ev.target.value, i)}></Input>
      );
    },
    "date range selector": (q, i) => {
      answers.current[i] = defaultValues["date range selector"];
      let el = null;

      return (
        <>
          <span style={{ fontSize: 12 }}>
            <strong ref={(t) => (el = t)}>12 months</strong>
          </span>
          <Slider
            max={24}
            defaultValue={12}
            onChange={function (v) {
              if (el) el.innerText = v + " months";

              updateAnswer(v + " months", i);
            }}
            tooltip={{ formatter: (d) => d + " months" }}
          ></Slider>
        </>
      );
    },
  };

  return (
    <ClarifyWrap>
      {success && clarification_questions.length ? (
        <>
          <h3>Please provide the following additional info</h3>
          <ul>
            {clarification_questions.map((q, i) => (
              <li key={q.question}>
                <Writer s={q.question} animate={!stageDone}>
                  <p className="q-desc writer-target"></p>
                  <div className="writer-children">
                    {UIs[q.ui_tool](q, i, q.ui_tool_options)}
                  </div>
                </Writer>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
      {stageDone ? (
        <></>
      ) : (
        <AgentLoader
          message={"Loading"}
          lottie={<Lottie animationData={LoadingLottie} loop={true} />}
        />
      )}
      <Button onClick={onSubmit} disabled={globalLoading} type="primary">
        Submit
      </Button>
    </ClarifyWrap>
  );
}

const ClarifyWrap = styled.div`
  .ant-slider,
  .ant-select,
  .ant-input {
    min-width: 300px;
    max-width: 500px;
  }
  ul {
    margin-block-start: 0;
    padding-inline-start: 0;

    li {
      list-style: none;
      margin-bottom: 2em;
      .q-desc {
        font-style: italic;
      }
    }
  }
`;

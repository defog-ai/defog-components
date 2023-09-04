import { Button, Input, Select, Slider } from "antd";
import React, { useRef, Fragment } from "react";
import { styled } from "styled-components";
import Lottie from "lottie-react";
import LoadingLottie from "../../components/svg/loader.json";
import AgentLoader from "../common/AgentLoader";
import Writer from "../agent/Writer";

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

  const answers = useRef(clarification_questions);

  // answers has only been initialized with the first element
  // so check this on all subsequent renders
  if (clarification_questions.length > answers.current.length) {
    // add the new elements from clarification_questions
    answers.current = answers.current.concat(
      clarification_questions.slice(answers.current.length),
    );
  }

  function createDropdownOptions(arr) {
    if (!Array.isArray(arr) || !arr) {
      return [];
    }
    return arr.map((d) => ({ label: d, value: d }));
  }

  function updateAnswer(newAns, i, formattedReponse = null) {
    answers.current[i].response = newAns;
    if (formattedReponse) {
      answers.current[i].response_formatted = formattedReponse;
    } else {
      answers.current[i].response_formatted = newAns;
    }
  }

  function onSubmit() {
    handleSubmit(null, { clarification_questions: answers.current }, "clarify");
  }

  const UIs = {
    "multi select": (q, i, opts) => {
      return (
        <Select
          mode="multiple"
          options={createDropdownOptions(opts)}
          defaultValue={q.response}
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
      return (
        <Input
          onChange={(ev) => updateAnswer(ev.target.value, i)}
          defaultValue={q.response}
        ></Input>
      );
    },
    "date range selector": (q, i) => {
      let el = null;

      return (
        <>
          <span style={{ fontSize: 12 }}>
            <strong ref={(t) => (el = t)}>{q.response_formatted}</strong>
          </span>
          <Slider
            max={24}
            defaultValue={q.response}
            onChange={function (v) {
              updateAnswer(v, i, v + " months");
              if (el) el.innerText = q.response_formatted;
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

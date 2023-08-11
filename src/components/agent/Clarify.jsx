import { Button, Input, Select, Slider } from "antd";
import React, { useRef, useState } from "react";
import { styled } from "styled-components";

export default function Clarify({ data, handleSubmit }) {
  if (!data) return;

  const { clarification_questions, success } = data;

  const answers = useRef(clarification_questions.questions.map((d) => null));

  function genLabels(arr) {
    return arr.map((d) => ({ label: d, value: d }));
  }

  function updateAnswer(newAns, i) {
    const newAnswers = answers.current.slice();
    answers.current[i] = newAns;
  }

  function onSubmit() {
    clarification_questions.questions.forEach((q, i) => {
      q["response"] = answers.current[i];
    });

    handleSubmit(null, { clarification_questions });
  }

  const UIs = {
    "multi select": (q, i, opts) => {
      answers.current[i] = [];
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
      answers.current[i] = "";
      return (
        <Input onChange={(ev) => updateAnswer(ev.target.value, i)}></Input>
      );
    },
    "date range selector": (q, i) => {
      answers.current[i] = 0;
      let val = useRef(null);

      return (
        <>
          <span style={{ fontSize: 12 }}>
            <strong ref={val}>12 months</strong>
          </span>
          <Slider
            max={24}
            defaultValue={12}
            onChange={(v) => {
              val.current.innerText = v + " months";
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
      <h3>Please provide the following additional info</h3>
      {success ? (
        <ul>
          {clarification_questions.questions.map((q, i) => (
            <li key={q.question}>
              <p className="q-desc">{q.question}</p>
              <div>{UIs[q.ui_tool](q, i, q.ui_tool_options)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <></>
      )}
      <Button onClick={onSubmit}>Submit</Button>
    </ClarifyWrap>
  );
}

const ClarifyWrap = styled.div`
  max-width: 800px;
  margin-left: 2em;
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

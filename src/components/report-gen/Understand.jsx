import { Button, Checkbox } from "antd";
import React, { useRef, Fragment } from "react";
import { styled } from "styled-components";
import Lottie from "lottie-react";
import LoadingLottie from "../../components/svg/loader.json";
import AgentLoader from "../common/AgentLoader";
import Writer from "../agent/Writer";

export default function Understand({
  data,
  handleSubmit,
  globalLoading,
  stageDone = true,
}) {
  // data format: [
  //   {
  //     question: str,
  //     answer: str,
  //     checked: true/false (checked or not)
  //   },
  // ]
  if (!data || !data.understanding || !data.success)
    return (
      <div className="agent-error">
        Something went wrong, please retry or contact us if it fails again.
      </div>
    );

  const { understanding, success } = data;

  const checked = useRef(understanding);

  // checked has only been initialized with the first element
  // so check this on all subsequent renders
  if (understanding.length > checked.current.length) {
    // add the new elements from understanding
    checked.current = checked.current.concat(
      understanding.slice(checked.current.length),
    );
  }

  function handleCheck(ev, i) {
    checked.current[i]["checked"] = ev.target.checked;
  }

  function onSubmit() {
    handleSubmit(null, { understanding: checked.current }, "understand");
  }

  return (
    <UnderstandWrap>
      <h3>
        {
          "The model has developed it's understanding of the problem. Please uncheck if you don't want any of the following to apply."
        }
      </h3>
      {success ? (
        <ul>
          {understanding.map((u, i) => (
            <li key={u.answer + "-" + i}>
              <Checkbox
                onChange={(ev) => handleCheck(ev, i)}
                defaultChecked={u.checked}
              >
                <Writer s={u.answer} animate={!stageDone}>
                  <span className="writer-target"></span>
                </Writer>
              </Checkbox>
            </li>
          ))}
        </ul>
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
    </UnderstandWrap>
  );
}

const UnderstandWrap = styled.div`
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

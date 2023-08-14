import { Button, Checkbox } from "antd";
import React, { useRef } from "react";
import { styled } from "styled-components";

export default function Understand({ data, handleSubmit }) {
  const { understanding, success } = data;

  const checked = useRef(understanding.map(() => true));

  function handleCheck(ev, i) {
    checked.current[i] = ev.target.checked;
  }

  function onSubmit() {
    const understandingFiltered = understanding
      .filter((_, i) => checked.current[i])
      .map((d) => d[0]);

    handleSubmit(null, { understanding: understandingFiltered }, "understand");
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
            <li key={u}>
              <Checkbox
                onChange={(ev) => handleCheck(ev, i)}
                defaultChecked={true}
              >
                {u}
              </Checkbox>
            </li>
          ))}
        </ul>
      ) : (
        <></>
      )}
      <Button onClick={onSubmit}>Submit</Button>
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

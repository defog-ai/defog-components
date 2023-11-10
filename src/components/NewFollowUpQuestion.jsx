import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "../context/ThemeContext";
import { Button } from "antd";
import { BsPlusCircle } from "react-icons/bs";
import Search from "antd/es/input/Search";
import { AnswerWrap } from "./common/utils";

export default function NewFollowUpQuestion({
  parentLevel,
  onSearch,
  answer,
  hasChildren,
  followUpLoader,
  globalLoading,
}) {
  const { theme } = useContext(ThemeContext);
  const [showNewFollowUp, setShowNewFollowUp] = useState(false);
  const customButton = <Button>Ask Follow Up</Button>;
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const [followUpText, setFollowUpText] = useState("");
  useEffect(() => {
    // if global loading goes to false, set button loading to false
    // but not if global loading goes to true, because global loading could be true but this current answer might not be the one that fired it
    if (globalLoading === false) {
      setFollowUpLoading(false);
      setShowNewFollowUp(false);
    }
  }, [globalLoading]);

  return (
    <NewFollowUpQuestionWrap
      hasChildren={hasChildren}
      level={parentLevel}
      theme={theme.config}
    >
      <div
        className={answer ? "answer-child-ctr" : "answer-root"}
        style={{
          position: "relative",
          // backgroundColor: theme.config.background2,
          padding: "0em 0.2em 0em 1em",
          borderLeft: "2px solid #f4f4f4",
        }}
      >
        {answer &&
          (showNewFollowUp ? (
            <AnswerWrap level={parentLevel} theme={theme.config}>
              {followUpLoading ? (
                followUpLoader
              ) : (
                <Search
                  value={followUpText}
                  autoFocus={true}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  onBlur={() => {
                    setShowNewFollowUp(false);
                  }}
                  className="follow-up-search"
                  placeholder={"Continue asking related questions"}
                  enterButton={customButton}
                  size="small"
                  onSearch={(query) => {
                    setFollowUpLoading(true);
                    onSearch(query);
                  }}
                  loading={followUpLoading}
                  disabled={followUpLoading}
                />
              )}
            </AnswerWrap>
          ) : (
            <Button
              className="follow-up-indicator"
              onClick={() => {
                setShowNewFollowUp(true);
              }}
              size="small"
            >
              <BsPlusCircle />
              <span className="follow-up-indicator-text">
                {hasChildren
                  ? "Ask more related questions"
                  : "Ask related question"}
              </span>
            </Button>
          ))}
      </div>
    </NewFollowUpQuestionWrap>
  );
}

const NewFollowUpQuestionWrap = styled.div`
  margin-bottom: 12px;
  transition: all 0.2s ease-in-out;
  min-height: 50px;

  .follow-up-search {
    max-width: 100%;
    height: 50px;
  }

  .follow-up-indicator {
    border: none;
    color: #ccc;
    font-weight: bold;
    font-size: 0.9em;
    background: transparent;
    box-shadow: none;
    padding: 0;
    position: relative;
    svg {
      position: relative;
      top: 1px;
      margin-right: 0.3em;
    }
    span {
      transition: all 0.2s ease-in-out;
      opacity: 0;
    }
  }
  .question-mode-select {
    top: 2px;
  }
  .ant-input-group-wrapper {
    padding: 6px;
    border-radius: 10px;
    border: 1px solid
      ${(props) => (props.theme ? props.theme.brandColor : "#2B59FF")};

    .ant-input-wrapper {
      display: flex;
    }

    .ant-input {
      border: none;
      width: calc(100% - 120px);
      background-color: transparent;
      color: ${(props) => (props.theme ? props.theme.primaryText : "#0D0D0D")};

      &::placeholder {
        color: ${(props) =>
          props.theme ? props.theme.primaryText : "#0D0D0D"};
        opacity: 0.7;
      }
    }
    .ant-input:focus,
    .ant-input-focused {
      box-shadow: none;
    }
    .ant-input-group-addon {
      button {
        min-height: 36px;
        min-width: 120px;
        border-radius: 6px !important;
        border-color: transparent;
        color: #fff !important;
        box-shadow: none !important;
        background: ${(props) =>
          props.theme ? props.theme.brandColor : "#2B59FF"};
      }
    }
  }
`;

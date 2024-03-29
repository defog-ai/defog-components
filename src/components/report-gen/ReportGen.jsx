import React, { useContext, useEffect, useRef, Fragment } from "react";
import { Carousel } from "antd";
import Understand from "./Understand";
import Clarify from "./Clarify";
import Approaches from "./Approaches";
import { ThemeContext } from "../../context/ThemeContext";
import { styled } from "styled-components";
import Search from "antd/lib/input/Search";

const generationStages = [
  "clarify",
  // "understand",
  "gen_approaches",
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

const components = {
  clarify: Clarify,
  understand: Understand,
  gen_approaches: Approaches,
};

export default function ReportGen({
  reportData,
  user_question = null,
  // if the "current stage" is done or not
  stageDone = true,
  // if any stage is currently loading, disable submits on all stages
  currentStage = null,
  handleSubmit = () => {},
  globalLoading,
  searchRef = null,
  handleEdit = () => {},
}) {
  const { theme } = useContext(ThemeContext);
  const carousel = useRef(null);

  console.log(currentStage);

  useEffect(() => {
    if (currentStage && carousel.current) {
      const idx = generationStages.indexOf(currentStage);
      // if idx is -1, we're probably already generated a report. set to last (aka approaches)
      carousel.current.goTo(idx > -1 ? idx : generationStages.length - 1);
      // go to the top of the screen
      window.scrollTo(0, 0);
    }
  }, [currentStage]);

  return (
    <ReportGenWrap theme={theme}>
      <>
        <Search
          onPressEnter={(ev) => handleSubmit(ev)}
          onSearch={(ev) => {
            handleSubmit(ev);
          }}
          ref={searchRef}
          disabled={currentStage !== null}
          placeholder="Ask a question"
          enterButton="Ask"
          defaultValue={user_question || null}
        ></Search>
      </>

      <div className="carousel-ctr">
        <Carousel dotPosition="top" ref={carousel}>
          {Object.keys(reportData)
            .filter((d) => generationStages.indexOf(d) > -1 && reportData[d])
            .map((stage) => {
              return (
                <div
                  key={stage}
                  className={
                    Object.keys(reportData).indexOf(stage) > -1
                      ? "ready"
                      : "not-ready"
                  }
                >
                  <h3 className="stage-heading">{agentRequestNames[stage]}</h3>

                  {components[stage]
                    ? React.createElement(components[stage], {
                        data: reportData[stage],
                        handleSubmit,
                        theme: theme,
                        globalLoading: globalLoading,
                        stageDone: stage === currentStage ? stageDone : true,
                        handleEdit,
                      })
                    : null}
                </div>
              );
            })}
        </Carousel>
      </div>
    </ReportGenWrap>
  );
}

const ReportGenWrap = styled.div`
  max-width: 800px;
  margin: 0 auto;
  .slick-list {
    top: 40px;
  }
  .stage-heading {
    text-align: center;
    color: gray;
    font-weight: normal;
    font-size: 0.8em;
    margin-bottom: 3em;
    pointer-events: none;
  }
  .ant-input-search .ant-input {
    background-color: white;
    color: #3a3a3a;
    * {
      color: #3a3a3a;
    }
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

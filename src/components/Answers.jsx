import React, {
  useState,
  Fragment,
  useMemo,
  useContext,
  useEffect,
} from "react";
import DefogDynamicViz from "./DefogDynamicViz";
import SearchState from "./SearchState";
import Lottie from "lottie-react";
import LoadingLottie from "./svg/loader.json";
import { ThemeContext } from "../context/ThemeContext";
import NewFollowUpQuestion from "./NewFollowUpQuestion";
import styled from "styled-components";
import { AnswerWrap } from "./common/utils";

const Answers = ({
  questionsAsked,
  debugMode,
  sqlOnly,
  globalLoading,
  handleSubmit,
  // level0Loading is used when a question is asked using the main search bar and not a follow up question
  level0Loading,
}) => {
  const { theme } = useContext(ThemeContext);
  const [followUpLoadingId, setFollowUpLoadingId] = useState(null);
  const [followUpQuestionText, setFollowUpQuestionText] = useState(null);

  let followUpQuestion = (query, parentQuestionId, parentQuestion) => {
    setFollowUpLoadingId(parentQuestionId);
    setFollowUpQuestionText(query);

    // go through all parents of this question and get their question and sql
    const previousQuestions = [];
    let obj = parentQuestion;
    while (obj && !obj.root) {
      const nextParentQuestion = obj.answer.question;
      const nextParentSql = obj.answer.generatedSql;
      previousQuestions.push(nextParentQuestion);
      previousQuestions.push(nextParentSql);
      obj = obj.parent;
    }
    handleSubmit(query, parentQuestionId, previousQuestions);
  };

  useEffect(() => {
    // if level0Loading is true, scroll to the bottom of the page
    if (level0Loading) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  const answers = useMemo(() => {
    // Convert questionsAsked object into an array of answer objects
    const questionsAskedArray = Object.keys(questionsAsked).map(
      (questionId) => {
        const {
          question,
          sql,
          level,
          parentQuestionId,
          askedAt,
          columns,
          data,
        } = questionsAsked[questionId];
        return {
          questionId,
          question,
          generatedSql: sql,
          level,
          parentQuestionId,
          askedAt,
          columns,
          data,
        };
      },
    );
    // Now, we want to sort answers so that it's like the following:
    // - all answers with level = 0 are sorted in ascending order of askedAt
    // - any answers that are children of a given answer are included right after their parent answer

    // First, sort the level 0 answers by their 'askedAt' ISOstring in ascending order
    questionsAskedArray.sort((a, b) => {
      if (a.level === 0 && b.level === 0) {
        return a.askedAt > b.askedAt;
      }
      return 0; // Keep the original order if levels are not 0
    });
    // create a nested parent/children tree using the questionsAsked object
    const root = {
      root: true,
      title: "All questions",
      key: "root",
      children: [],
    };

    // references will be used to easily find a given question within the root object
    // so we don't have to iterate through the root object to find the parent every time
    const references = {};
    questionsAskedArray.forEach((question) => {
      const { parentQuestionId, questionId } = question;
      const obj = {
        answer: question,
        title: question.question,
        key: questionId,
        children: [],
        parent: question.level === 0 ? root : references[parentQuestionId],
      };
      if (question.level === 0) {
        root.children.push(obj);
        references[questionId] = obj;
      } else {
        if (!references[parentQuestionId]) {
          // this should never happen
          console.log("parent question not found for question: ", question);
          return;
        }
        references[parentQuestionId].children.push(obj);
        // add a reference to the child so we can easily find it later
        references[questionId] = obj;
      }
    });
    setFollowUpLoadingId(null);
    return root;
  }, [questionsAsked]);

  const loader =
    followUpLoadingId || level0Loading ? (
      <div
        style={{
          background: theme.config.background2,
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        {/* <QALayout type={"Question"}> */}
        <p style={{ margin: 0 }}>{level0Loading || followUpQuestionText}</p>
        {/* </QALayout> */}

        <div
          className="data-loading-search-state"
          style={{ width: "50%", margin: "0 auto" }}
        >
          <SearchState
            message={"Generating a query for your question..."}
            lottie={<Lottie animationData={LoadingLottie} loop={true} />}
          />
        </div>
      </div>
    ) : null;

  function createChildren(obj) {
    const { answer, children } = obj;

    return (
      <AnswerChildCtrWrap isroot={!answer ? 1 : 0} key={obj.key}>
        <div
          className={answer ? "answer-child-ctr" : "answer-root"}
          key={obj.key}
          style={{
            position: "relative",
            // backgroundColor: theme.config.background2,
            padding: answer ? "0.4em 0.2em 0.4em 1em" : "0",
            borderLeft: answer?.level > 0 ? "2px solid #f4f4f4" : "none",
          }}
        >
          {answer ? (
            <DefogDynamicViz
              key={answer.questionId}
              query={answer.question}
              questionId={answer.questionId}
              response={answer}
              debugMode={debugMode}
              sqlOnly={sqlOnly}
              level={answer.level}
            />
          ) : (
            <></>
          )}
          <div
            className="answer-children-ctr"
            style={{
              margin: answer ? "1em 0.9em" : "0",
              marginTop: answer && children?.length > 0 ? "1em" : "0.5em",
            }}
          >
            {children.map((child) => {
              return createChildren(child);
            })}
            {/* extra child for when follow up is clicked */}
            {answer ? (
              <NewFollowUpQuestion
                key={answer?.questionId + "-new"}
                followUpLoader={
                  answer && followUpLoadingId === answer.questionId && loader
                }
                answer={answer}
                parentLevel={answer?.level}
                hasChildren={children.length > 0}
                globalLoading={globalLoading}
                onSearch={(query) =>
                  followUpQuestion(query, answer.questionId, obj)
                }
              />
            ) : null}
            {!answer && level0Loading && (
              <AnswerWrap theme={theme.config} margin="0.4em 0.2em 1em 1em">
                {loader}
              </AnswerWrap>
            )}
          </div>
        </div>
      </AnswerChildCtrWrap>
    );
  }

  return (
    <>
      {/* <Sidebar answers={answers.children} /> */}
      <div>{createChildren(answers)}</div>
    </>
  );
};

export default React.memo(Answers);

const AnswerChildCtrWrap = styled.div`
  :hover {
    > .answer-children-ctr {
      .follow-up-indicator span {
        opacity: ${(props) => (props.isroot ? 0 : 1)};
      }
    }
  }
`;

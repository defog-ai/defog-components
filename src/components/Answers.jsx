import React, { useState, useEffect } from 'react'
import DefogDynamicViz from './DefogDynamicViz';

const Answers = ({
  questionsAsked,
  debugMode,
  sqlOnly,
  buttonLoading,
  handleSubmit,
  forceReload,
}) => {
  const [answers, setAnswers] = useState([]);

  let followUpQuestion = (question, parentQuestionId) => {
    const previousQuestions = []
    let nextParent = parentQuestionId;
    while (nextParent) {
      const nextParentQuestion = questionsAsked[nextParent]['question'];
      const nextParentSql = questionsAsked[nextParent]['sql'];
      previousQuestions.push(nextParentQuestion);
      previousQuestions.push(nextParentSql);
      nextParent = questionsAsked[nextParent]?.parentQuestionId;
    }
    handleSubmit(question, parentQuestionId, previousQuestions);
  }
  
  useEffect(() => {
    const answers = Object.keys(questionsAsked).map((questionId) => {
      const { question, sql, level, parentQuestionId, askedAt, columns, data } = questionsAsked[questionId];
      return {
        questionId,
        question,
        generatedSql: sql,
        level,
        parentQuestionId,
        askedAt,
        columns,
        data,
      }
    });
    answers.sort((a, b) => {
      if (a.level === 0 && b.level === 0) {
        return a.askedAt > b.askedAt;
      }
      return 0;
    });

    const parentToChildrenMap = answers.reduce((map, answer) => {
      if (answer.parentQuestionId !== undefined) {
        if (!map[answer.parentQuestionId]) {
          map[answer.parentQuestionId] = [];
        }
        map[answer.parentQuestionId].push(answer);
      }
      return map;
    }, {});
    
    const getOrderedAnswers = (answerList, parentId) => {
      let orderedAnswers = [];
      for (const answer of answerList) {
        if ((answer.parentQuestionId === parentId && answer.level !== 0) || (parentId === undefined && answer.level === 0)) {
          orderedAnswers.push(answer);
          // If this answer has children, add them right after the answer
          if (parentToChildrenMap[answer.questionId]) {
            const children = getOrderedAnswers(parentToChildrenMap[answer.questionId], answer.questionId);
            orderedAnswers = orderedAnswers.concat(children);
          }
        }
      }
      return orderedAnswers;
    };

    const orderedAnswers = getOrderedAnswers(answers);

    setAnswers(orderedAnswers);
  }, [questionsAsked, forceReload]);
  
  return (
    <div>
      {answers.map((answer) => {
        return (<DefogDynamicViz
          key={answer.questionId}
          query={answer.question}
          questionId={answer.questionId}
          response={answer}
          debugMode={debugMode}
          sqlOnly={sqlOnly}
          followUpQuestion={followUpQuestion}
          buttonLoading={buttonLoading}
          level={answer.level}
        />)
      })}
    </div>
  )
}

export default React.memo(Answers);
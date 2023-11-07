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

  const followUpQuestion = (question, parentQuestionId) => {
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
    setAnswers(answers);
    console.log(answers);
  }, [forceReload]);
  
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

export default Answers
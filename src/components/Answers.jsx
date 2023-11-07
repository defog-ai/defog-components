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
    // Convert questionsAsked object into an array of answer objects
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

    // Now, we want to sort answers so that it's like the following:
    // - all answers with level = 0 are sorted in ascending order of askedAt
    // - any answers that are children of a given answer are included right after their parent answer

    // First, sort the level 0 answers by their 'askedAt' ISOstring in ascending order
    answers.sort((a, b) => {
      if (a.level === 0 && b.level === 0) {
        return a.askedAt > b.askedAt;
      }
      return 0; // Keep the original order if levels are not 0
    });

    // Create a mapping from parentQuestionId to its corresponding child answers
    const parentToChildrenMap = answers.reduce((map, answer) => {
      if (answer.parentQuestionId !== undefined) {
        if (!map[answer.parentQuestionId]) {
          map[answer.parentQuestionId] = [];
        }
        map[answer.parentQuestionId].push(answer);
      }
      return map;
    }, {});
    
    // Recursive function to build the sorted answer list according to the hierarchy
    const getOrderedAnswers = (answerList, parentId) => {
      let orderedAnswers = [];
      for (const answer of answerList) {
        // Check if the current answer is a child of the given parentId or is a level 0 answer
        if ((answer.parentQuestionId === parentId && answer.level !== 0) || (parentId === undefined && answer.level === 0)) {
          orderedAnswers.push(answer);
          // If this answer has children, add them right after the answer
          if (parentToChildrenMap[answer.questionId]) {
            // Recursively get the children answers and add them to the list
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
import React from "react";

export default function Clarify({ data }) {
  if (!data) return;

  console.log(data);
  const { clarification_questions, success } = data;

  return (
    <>
      <h1>Clarify Stage</h1>
      {success ? (
        <ul>
          {clarification_questions.questions.map((q) => (
            <li key={q.question}>{q.question}</li>
          ))}
        </ul>
      ) : (
        <></>
      )}
    </>
  );
}

import React, { useState } from "react";
import { Button, Input, message } from "antd";

const Feedback = ({
  apiKey,
  dev,
  guidedTeaching,
  questionId,
  response,
  setModalVisible,
}) => {
  const [hasReflected, setHasReflected] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState("");
  const [reflectionColDescriptions, setReflectionColDescriptions] = useState(
    [],
  );
  const [reflectionRefQueries, setReflectionRefQueries] = useState([]);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [glossary, setGlossary] = useState("");
  const [postReflectionLoading, setPostReflectionLoading] = useState(false);
  const { TextArea } = Input;

  const uploadFeedback = async (
    feedbackText = "",
    giveSuggestions = guidedTeaching,
  ) => {
    // send feedback over to the server
    await fetch(`https://api.defog.ai/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: apiKey,
        response: response,
        feedback: "Bad",
        text: feedbackText,
        dev: dev,
      }),
    });

    if (giveSuggestions) {
      // send the error to the reflect endpoint
      setReflectionLoading(true);
      message.info(
        "Preparing improved instruction sets for the model. This can take up to 30 seconds. Thank you for your patience.",
      );

      // first, get the metadata so that we can easily compare it against the reflection
      const metadataResp = await fetch(`https://api.defog.ai/get_metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          dev: dev,
        }),
      });
      const { table_metadata, glossary } = await metadataResp.json();
      setGlossary(glossary);

      const reflectResp = await fetch(`https://api.defog.ai/reflect_on_error`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          question: response.question,
          sql_generated: response.generatedSql,
          error: feedbackText,
          dev: dev,
        }),
      });

      const {
        feedback,
        instruction_set,
        column_descriptions,
        reference_queries,
      } = await reflectResp.json();

      // table_metadata is currently an object in the form of {table_name: [{column_name: ..., description: ...}]}
      // we need to convert it to an array of objects in the form of {table_name: ..., column_name: ..., description: ...}
      const column_descriptions_array = [];
      for (const table_name in table_metadata) {
        const columns = table_metadata[table_name];
        columns.forEach((column) => {
          column_descriptions_array.push({
            table_name: table_name,
            column_name: column.column_name,
            data_type: column.data_type,
            original_description: column.column_description,
          });
        });
      }

      // add a new key to each item in column_descriptions called "original description". this is the column description from the metadata
      const updatedDescriptions = [];

      column_descriptions_array.forEach((item) => {
        const found = column_descriptions.find(
          (meta) =>
            meta.table_name === item.table_name &&
            meta.column_name === item.column_name,
        );
        if (found) {
          updatedDescriptions.push({
            ...item,
            updated_description: found.description,
          });
        }
      });

      setHasReflected(true);
      setReflectionFeedback(feedback);
      setGlossary(glossary + "\n\n(new instructions)\n\n" + instruction_set);
      setReflectionColDescriptions(updatedDescriptions);
      setReflectionRefQueries(reference_queries);
      setReflectionLoading(false);
    } else {
      setModalVisible(false);
    }
  };

  const updateNewInstructions = async () => {
    setPostReflectionLoading(true);
    // update glossary
    await fetch(`https://api.defog.ai/update_glossary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        glossary: glossary,
        dev: dev,
      }),
    });

    // update golden queries
    await fetch(`https://api.defog.ai/update_golden_queries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        golden_queries: reflectionRefQueries,
        scrub: false,
        dev: dev,
      }),
    });

    // update column descriptions
    await fetch(`https://api.defog.ai/update_column_descriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        column_descriptions: reflectionColDescriptions,
        dev: dev,
      }),
    });

    setPostReflectionLoading(false);
    setModalVisible(false);
    message.info(
      "The model's instruction set has now been updated. Thank you for the feedback!",
    );
  };

  return (
    <div>
      <TextArea
        rows={4}
        className="feedback-text"
        placeholder="Optional"
        id={"feedback-text-" + questionId}
      />
      {!hasReflected ? (
        <>
          <Button
            loading={reflectionLoading}
            disabled={reflectionLoading}
            onClick={() => {
              // upload feedback, based on the value of the text area
              const feedbackText = document.getElementById(
                "feedback-text-" + questionId,
              ).value;
              uploadFeedback(feedbackText, false);
            }}
          >
            Submit
          </Button>
          {guidedTeaching ? (
            <Button
              loading={reflectionLoading}
              disabled={reflectionLoading}
              onClick={() => {
                // upload feedback, based on the value of the text area
                const feedbackText = document.getElementById(
                  "feedback-text-" + questionId,
                ).value;
                uploadFeedback(feedbackText, guidedTeaching);
              }}
            >
              Submit and get suggestions for improvement
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <p>{reflectionFeedback}</p>

          <p>Instruction Set:</p>
          <TextArea
            rows={8}
            value={glossary}
            onChange={(e) => setGlossary(e.target.value)}
            style={{
              marginTop: "1em",
              marginBottom: "1em",
            }}
          />
          <p>Column Descriptions:</p>
          <ul>
            {reflectionColDescriptions.map((item, idx) => {
              return (
                <li key={idx}>
                  Table Name: {item.table_name}
                  <br />
                  Column Name: {item.column_name}
                  <br />
                  Original Description: {item.original_description}
                  <br />
                  Suggested Description:{" "}
                  <TextArea
                    rows={2}
                    value={item.updated_description}
                    onChange={(e) => {
                      const updatedDescriptions = [
                        ...reflectionColDescriptions,
                      ];
                      updatedDescriptions[idx].updated_description =
                        e.target.value;
                      setReflectionColDescriptions(updatedDescriptions);
                    }}
                    style={{
                      marginBottom: "1em",
                    }}
                  />
                </li>
              );
            })}
          </ul>
          <p>Reference Queries:</p>
          <ul>
            {reflectionRefQueries.map((item, idx) => {
              return (
                <li key={idx}>
                  Question: {item.question}
                  <br />
                  SQL:{" "}
                  <TextArea
                    rows={8}
                    value={item.sql}
                    onChange={(e) => {
                      const updatedQueries = [...reflectionRefQueries];
                      updatedQueries[idx].sql = e.target.value;
                      setReflectionRefQueries(updatedQueries);
                    }}
                    style={{
                      marginBottom: "1em",
                    }}
                  />
                </li>
              );
            })}
          </ul>

          <Button
            onClick={() => {
              updateNewInstructions();
            }}
            loading={postReflectionLoading}
            disabled={postReflectionLoading}
          >
            Update Instructions
          </Button>
        </>
      )}
    </div>
  );
};

export default Feedback;

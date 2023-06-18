import { log, randomSlice } from "./mock-data-utils";

const mockSubQuestions = [];

function createResponseObject(newProps = {}, testVals = null) {
  let selectedSubQns = randomSlice(mockSubQuestions);

  const base = {
    sub_qns: selectedSubQns,
    ran_successfully: true,
  };

  return Object.assign(base, newProps);
}

function* validResponse() {
  log("Testing with valid response.");
  yield createResponseObject();
}

function emptySubQns() {
  log("Testing with empty sub_qns.");
  return createResponseObject({ sub_qns: [] });
}

function nullSubQns() {
  log("Testing with null sub_qns.");
  return createResponseObject({ sub_qns: null });
}

function blankSubQns() {
  log("Testing with blank sub_qns.");
  return createResponseObject({ sub_qns: "" });
}

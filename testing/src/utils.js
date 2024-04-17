// shuffle array randomly
export function randomiseArray(arr) {
  const newArr = arr.slice();
  for (let i = 0; i < newArr.length; i++) {
    const randIndex = Math.floor(Math.random() * newArr.length);
    const temp = newArr[i];
    newArr[i] = newArr[randIndex];
    newArr[randIndex] = temp;
  }
  return newArr;
}

// random slice of an array
export function randomSlice(arr) {
  const start = Math.floor(Math.random() * arr.length);
  const end = Math.floor(Math.random() * (arr.length - start)) + start;
  return arr.slice(start, end);
}

export function log(s1 = "", s2 = null) {
  console.log(s1);
  window.logStr = s2 ? s2 : s1;
}

export function* testResponseProp(
  newProps,
  prop,
  baseResponseObjectCreator,
  vals = []
) {
  for (let i = 0; i < vals.length; i++) {
    const res = baseResponseObjectCreator(newProps);
    window.logStr =
      `Testing ${prop} prop. Current value:` +
      JSON.stringify(vals[i] === "" ? "empty string" : vals[i]);

    console.log(
      `Testing %c${prop}\x1b[0m prop. Current value:`,
      "color: #ff0000",
      vals[i] === "" ? "empty string" : vals[i]
    );

    if (vals[i] === "delete") {
      delete res[prop];
    } else {
      res[prop] = vals[i];
    }

    yield res;
  }
}

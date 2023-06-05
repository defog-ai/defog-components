import renderer from "react-test-renderer";
import DefogDynamicViz from "../components/DefogDynamicViz";

import {
  ThemeContext,
  darkThemeColor,
  lightThemeColor,
} from "../context/ThemeContext";

const darkMode = false;

const theme = {
  type: darkMode === true ? "dark" : "light",
  config: darkMode === true ? darkThemeColor : lightThemeColor,
};

it("doesn't crash when all props empty arrays/objects/nulls", () => {
  // I ensure in processData -> utils() that it's always empty arrays that are returned. not nulls/undefineds
  let component = renderer.create(
    <ThemeContext.Provider value={{ theme }}>
      <DefogDynamicViz
        vizType={null}
        response={{}}
        rawData={[]}
        query={null}
        apiKey={null}
      />
    </ThemeContext.Provider>
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

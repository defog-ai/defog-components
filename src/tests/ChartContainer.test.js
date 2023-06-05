import renderer from "react-test-renderer";
import ChartContainer from "../components/ChartContainer";

it("doesn't crash when all props empty arrays/objects/nulls", () => {
  // I ensure in processData -> utils() that it's always empty arrays that are returned. not nulls/undefineds
  let component = renderer.create(
    <ChartContainer
      xAxisColumns={[]}
      dateColumns={[]}
      yAxisColumns={[]}
      xAxisColumnValues={{}}
      data={[]}
      title={null}
      vizType={null}
      theme={null}
    />
  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

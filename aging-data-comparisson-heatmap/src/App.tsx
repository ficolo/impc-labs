import React, { StrictMode } from "react";
import { useTheme } from "@nivo/core";
import { AxisTick, AxisTickProps } from "@nivo/axes";
import { ScaleValue } from "@nivo/scales";
import { data } from "./GeneVsProcedure.data";
import { ResponsiveHeatmapCanvasClickable } from "./ResponsiveHeatmapCanvasClickable";

export function App() {
  return (
    <div style={{ height: "10000px", marginRight: "10%", marginLeft: "10%" }}>
      <MyResponsiveHeatMapCanvas data={data} />
    </div>
  );
}

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const MyResponsiveHeatMapCanvas = ({ data }) => {
  const getChildren = () => {};
  return (
    <>
      <StrictMode>
        <ResponsiveHeatmapCanvasClickable
          data={data}
          margin={{ top: 200, right: 80, bottom: 20, left: 120 }}
          valueFormat={(v) => {
            const options = [
              "No data",
              "EA not significant -> LA not significant",
              "EA significant -> LA significant",
              "EA not significant -> LA significant",
              "EA significant -> LA not significant",
            ];
            return options[v];
          }}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: "",
            legendOffset: 50,
            renderTick: (tick) => (
              <ClickableAxisTick
                tick={tick}
                onClick={() => console.log("howdie")}
              />
            ),
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendPosition: "middle",
            legendOffset: 60,
          }}
          axisRight={null}
          colors={(cell) => {
            const options = [
              "#ECECEC",
              "#17a2b8",
              "#ed7b25",
              "#ed7b25",
              "#17a2b8",
            ];
            return options[cell.value || 0];
          }}
          labelTextColor="black"
          emptyColor="#ccc"
          borderWidth={0.25}
          borderColor="#000"
          enableLabels={false}
          legends={[
            {
              anchor: "right",
              translateX: 50,
              translateY: 0,
              length: 200,
              thickness: 10,
              direction: "column",
              tickPosition: "after",
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              tickFormat: ">-.0s",
              title: "Value →",
              titleAlign: "middle",
              titleOffset: 4,
            },
          ]}
          annotations={[]}
          onClick={(cell) => console.log(cell.data)}
          //hoverTarget="row"
        />
      </StrictMode>
    </>
  );
};

const ClickableAxisTick = ({ tick, onClick }) => {
  return <AxisTick {...tick} onClick={onClick} />;
};

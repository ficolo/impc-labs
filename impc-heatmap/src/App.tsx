import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { data } from "./GeneVsProcedure.data";
import { AxisTick, AxisTickProps } from "@nivo/axes";
import { ResponsiveHeatmapCanvasClickable } from "./ResponsiveHeatMapCanvasClickable";

function App() {
  return (
    <div style={{ height: "10000px", marginRight: "10%", marginLeft: "10%" }}>
      <ResponsiveHeatmapCanvasClickable
        data={data}
        margin={{ top: 200, right: 80, bottom: 20, left: 120 }}
        valueFormat={(v: any) => {
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
          renderTick: (tick: any) => (
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
        colors={(cell: any) => {
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
        onClick={(cell: any) => console.log(cell.data)}
        //hoverTarget="row"
      />
    </div>
  );
}

const ClickableAxisTick = ({
  tick,
  onClick,
}: {
  tick: any;
  onClick: () => void;
}) => {
  return <AxisTick {...tick} onClick={onClick} />;
};

export default App;

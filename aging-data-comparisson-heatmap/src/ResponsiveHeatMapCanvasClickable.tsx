import { ResponsiveWrapper } from "@nivo/core";
import {
  DefaultHeatMapDatum,
  HeatMapCanvasProps,
  HeatMapDatum,
} from "@nivo/heatmap";
import React from "react";
import { HeatMapCanvasClickable } from "./HeatMapCanvasClickable";

export const ResponsiveHeatmapCanvasClickable = <
  Datum extends HeatMapDatum = DefaultHeatMapDatum,
  ExtraProps extends object = Record<string, never>
>(
  props: Omit<HeatMapCanvasProps<Datum, ExtraProps>, "height" | "width">
) => (
  <ResponsiveWrapper>
    {({ width, height }) => (
      <HeatMapCanvasClickable<Datum, ExtraProps>
        width={width}
        height={height}
        {...props}
      />
    )}
  </ResponsiveWrapper>
);

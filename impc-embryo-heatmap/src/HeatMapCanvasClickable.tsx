import React, {
  useEffect,
  useRef,
  useCallback,
  createElement,
  useMemo,
  forwardRef,
  memo,
  useState,
} from "react";
import {
  getRelativeCursor,
  isCursorInRect,
  useDimensions,
  useTheme,
  Container,
  SvgWrapper,
} from "@nivo/core";
import {
  renderAxesToCanvas,
  renderGridLinesToCanvas,
  Axes,
  AxisProps,
} from "@nivo/axes";
import { useTooltip } from "@nivo/tooltip";
import { renderContinuousColorLegendToCanvas } from "@nivo/legends";
import {
  renderAnnotationsToCanvas,
  useComputedAnnotations,
} from "@nivo/annotations";
import {
  HeatMapDatum,
  HeatMapCanvasProps,
  canvasDefaultProps,
  CellShape,
  HeatMapCommonProps,
  useHeatMap,
  useCellAnnotations,
  CellCanvasRenderer,
  CustomLayerProps,
  DefaultHeatMapDatum,
} from "@nivo/heatmap";
import { ScaleValue, AnyScale } from "@nivo/scales";
import { renderCircle, renderRect } from "./canvas";
import { Axis } from "./AxisBackground";

type InnerNetworkCanvasProps<
  Datum extends HeatMapDatum,
  ExtraProps extends object
> = Omit<HeatMapCanvasProps<Datum, ExtraProps>, "renderWrapper" | "theme">;

const InnerHeatMapCanvas = <
  Datum extends HeatMapDatum,
  ExtraProps extends object
>({
  data,
  layers = canvasDefaultProps.layers,
  valueFormat,
  width,
  height,
  margin: partialMargin,
  xInnerPadding = canvasDefaultProps.xInnerPadding,
  xOuterPadding = canvasDefaultProps.xOuterPadding,
  yInnerPadding = canvasDefaultProps.yInnerPadding,
  yOuterPadding = canvasDefaultProps.yOuterPadding,
  forceSquare = canvasDefaultProps.forceSquare,
  sizeVariation = canvasDefaultProps.sizeVariation,
  renderCell: _renderCell = canvasDefaultProps.renderCell as CellShape,
  opacity = canvasDefaultProps.opacity,
  activeOpacity = canvasDefaultProps.activeOpacity,
  inactiveOpacity = canvasDefaultProps.inactiveOpacity,
  borderWidth = canvasDefaultProps.borderWidth,
  borderColor = canvasDefaultProps.borderColor as HeatMapCommonProps<Datum>["borderColor"],
  enableGridX = canvasDefaultProps.enableGridX,
  enableGridY = canvasDefaultProps.enableGridY,
  axisTop = canvasDefaultProps.axisTop,
  axisRight = canvasDefaultProps.axisRight,
  axisBottom = canvasDefaultProps.axisBottom,
  axisLeft = canvasDefaultProps.axisLeft,
  enableLabels = canvasDefaultProps.enableLabels,
  label = canvasDefaultProps.label as HeatMapCommonProps<Datum>["label"],
  labelTextColor = canvasDefaultProps.labelTextColor as HeatMapCommonProps<Datum>["labelTextColor"],
  colors = canvasDefaultProps.colors as HeatMapCommonProps<Datum>["colors"],
  emptyColor = canvasDefaultProps.emptyColor,
  legends = canvasDefaultProps.legends,
  annotations = canvasDefaultProps.annotations as HeatMapCommonProps<Datum>["annotations"],
  isInteractive = canvasDefaultProps.isInteractive,
  onClick,
  hoverTarget = canvasDefaultProps.hoverTarget,
  tooltip = canvasDefaultProps.tooltip as HeatMapCommonProps<Datum>["tooltip"],
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  pixelRatio = canvasDefaultProps.pixelRatio,
}: InnerNetworkCanvasProps<Datum, ExtraProps>) => {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const [actCell, setActCell] = useState<any>(null);

  const {
    margin: _margin,
    innerWidth: _innerWidth,
    innerHeight: _innerHeight,
    outerWidth,
    outerHeight,
  } = useDimensions(width, height, partialMargin);

  const {
    width: innerWidth,
    height: innerHeight,
    offsetX,
    offsetY,
    xScale,
    yScale,
    cells,
    colorScale,
    activeCell,
    setActiveCell,
  } = useHeatMap<Datum, ExtraProps>({
    data,
    valueFormat,
    width: _innerWidth,
    height: _innerHeight,
    xInnerPadding,
    xOuterPadding,
    yInnerPadding,
    yOuterPadding,
    forceSquare,
    sizeVariation,
    colors,
    emptyColor,
    opacity,
    activeOpacity,
    inactiveOpacity,
    borderColor,
    label,
    labelTextColor,
    hoverTarget,
  });

  const margin = useMemo(
    () => ({
      ..._margin,
      top: _margin.top + offsetY,
      left: _margin.left + offsetX,
    }),
    [_margin, offsetX, offsetY]
  );

  const boundAnnotations = useCellAnnotations(cells, annotations);
  const computedAnnotations = useComputedAnnotations({
    annotations: boundAnnotations,
  });

  let renderCell: CellCanvasRenderer<Datum>;
  if (typeof _renderCell === "function") {
    renderCell = _renderCell;
  } else if (_renderCell === "circle") {
    renderCell = renderCircle;
  } else {
    renderCell = renderRect;
  }

  const theme = useTheme();

  const customLayerProps: CustomLayerProps<Datum> = useMemo(
    () => ({
      cells,
      activeCell,
      setActiveCell,
    }),
    [cells, activeCell, setActiveCell]
  );

  useEffect(() => {
    if (canvasEl.current === null) return;

    const ctx = canvasEl.current.getContext("2d");
    if (!ctx) return;

    canvasEl.current.width = outerWidth * pixelRatio;
    canvasEl.current.height = outerHeight * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);

    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, outerWidth, outerHeight);
    // ctx.translate(margin.left, margin.top); // + offsetX, margin.top + offsetY)

    layers.forEach((layer) => {
      if (layer === "grid") {
        ctx.lineWidth = theme.grid.line.strokeWidth as number;
        ctx.strokeStyle = theme.grid.line.stroke as string;

        if (enableGridX) {
          renderGridLinesToCanvas(ctx, {
            width: innerWidth,
            height: innerHeight,
            scale: xScale,
            axis: "x",
          });
        }
        if (enableGridY) {
          renderGridLinesToCanvas(ctx, {
            width: innerWidth,
            height: innerHeight,
            scale: yScale,
            axis: "y",
          });
        }
      } else if (layer === "axes") {
        // renderAxesToCanvas(ctx, {
        //   xScale,
        //   yScale,
        //   width: innerWidth, // - offsetX * 2,
        //   height: innerHeight, // - offsetY * 2,
        //   top: axisTop,
        //   right: axisRight,
        //   bottom: axisBottom,
        //   left: axisLeft,
        //   theme,
        // });
      } else if (layer === "cells") {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        cells.forEach((cell) => {
          renderCell(ctx, { cell, borderWidth, enableLabels, theme });
        });
      } else if (layer === "legends" && colorScale !== null) {
        legends.forEach((legend) => {
          renderContinuousColorLegendToCanvas(ctx, {
            ...legend,
            containerWidth: innerWidth,
            containerHeight: innerHeight,
            scale: colorScale,
            theme,
          });
        });
      } else if (layer === "annotations") {
        renderAnnotationsToCanvas(ctx, {
          annotations: computedAnnotations,
          theme,
        });
      } else if (typeof layer === "function") {
        layer(ctx, customLayerProps);
      }
    });
  }, [
    canvasEl,
    pixelRatio,
    outerWidth,
    outerHeight,
    innerWidth,
    innerHeight,
    margin,
    layers,
    customLayerProps,
    cells,
    renderCell,
    enableGridX,
    enableGridY,
    axisTop,
    axisRight,
    axisBottom,
    axisLeft,
    xScale,
    yScale,
    theme,
    borderWidth,
    enableLabels,
    colorScale,
    legends,
    computedAnnotations,
  ]);

  const { showTooltipFromEvent, hideTooltip } = useTooltip();
  const [hover, setHover] = useState(false);

  const handleMouseHover = useCallback(
    (event: any) => {
      if (canvasEl.current === null) return;

      const [x, y] = getRelativeCursor(canvasEl.current, event);

      const cell = cells.find((c) =>
        isCursorInRect(
          c.x - c.width / 2, // + offsetX - c.width / 2,
          c.y - c.height / 2, //+ offsetY - c.height / 2,
          c.width,
          c.height,
          x,
          y
        )
      );
      if (cell !== undefined) {
        setActCell(cell);
        showTooltipFromEvent(createElement(tooltip, { cell }), event);
        setHover(true);
      } else {
        setActCell(null);
        hideTooltip();
      }
    },
    [
      canvasEl,
      cells,
      margin,
      // offsetX,
      // offsetY,
      setActiveCell,
      showTooltipFromEvent,
      hideTooltip,
      setActCell,
      tooltip,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    setActiveCell(null);
    hideTooltip();
    setHover(false);
  }, [setActiveCell, hideTooltip]);

  const handleClick = useCallback(
    (event: any) => {
      if (activeCell === null) return;

      onClick?.(activeCell, event);
    },
    [activeCell, onClick]
  );
  const [axisOffset, setAxisOffset] = useState(0);
  const svgRef = useRef(null);
  useEffect(() => {
    const handleScroll = (event: any) => {
      const element = document.getElementById("root");
      const elementOffset = element?.getBoundingClientRect().top || 0;
      setAxisOffset(elementOffset < 0 ? -elementOffset + 10 : 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <SvgWrapper
        width={outerWidth}
        height={outerHeight}
        margin={Object.assign({}, margin, {
          top: margin.top, //+ offsetY,
          left: margin.left, // + offsetX,
        })}
        role={role}
        ariaLabel={ariaLabel}
        ariaLabelledBy={ariaLabelledBy}
        ariaDescribedBy={ariaDescribedBy}
      >
        <foreignObject
          width={outerWidth * pixelRatio}
          height={outerHeight * pixelRatio}
        >
          <canvas
            ref={canvasEl}
            width={outerWidth * pixelRatio}
            height={outerHeight * pixelRatio}
            style={{
              width: outerWidth,
              height: outerHeight,
              zIndex: 0,
            }}
            onMouseEnter={isInteractive ? handleMouseHover : undefined}
            onMouseMove={isInteractive ? handleMouseHover : undefined}
            onMouseLeave={isInteractive ? handleMouseLeave : undefined}
            onClick={isInteractive ? handleClick : undefined}
            role={role}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
          />
        </foreignObject>
        {hover ? (
          <>
            <rect
              x={0}
              y={0}
              width={actCell ? actCell.x - actCell.width / 2 : 0}
              height={actCell ? actCell.y - actCell.height / 2 : 0}
              fill={"rgba(255,255,255, 0.8)"}
              style={{ pointerEvents: "none" }}
            />
            <rect
              x={actCell ? actCell.x + actCell.width / 2 : 0}
              y={0}
              width={actCell ? outerWidth - actCell.x - actCell.width / 2 : 0}
              height={actCell ? actCell.y - actCell.height / 2 : 0}
              fill={"rgba(255,255,255, 0.8)"}
              style={{ pointerEvents: "none" }}
            />
            <rect
              x={0}
              y={actCell ? actCell.y + actCell.height / 2 : 0}
              width={actCell ? actCell.x - actCell.width / 2 : 0}
              height={actCell ? innerHeight : 0}
              fill={"rgba(255,255,255, 0.8)"}
              style={{ pointerEvents: "none" }}
            />
            <rect
              x={actCell ? actCell.x + actCell.width / 2 : 0}
              y={actCell ? actCell.y + actCell.height / 2 : 0}
              width={actCell ? outerWidth - actCell.x - actCell.width / 2 : 0}
              height={actCell ? innerHeight : 0}
              fill={"rgba(255,255,255, 0.8)"}
              style={{ pointerEvents: "none" }}
            />
          </>
        ) : null}

        <AxesStickyXAxis
          key="axes"
          xScale={xScale}
          yScale={yScale}
          width={innerWidth} // - offsetX * 2
          height={innerHeight} // - offsetY * 2
          top={axisTop as AxisProps<ScaleValue>}
          right={axisRight as AxisProps<ScaleValue>}
          bottom={axisBottom as AxisProps<ScaleValue>}
          left={axisLeft as AxisProps<ScaleValue>}
          axisOffset={axisOffset}
          sticky={true}
        />
      </SvgWrapper>
    </>
  );
};

export const HeatMapCanvasClickable = <
  Datum extends HeatMapDatum = DefaultHeatMapDatum,
  ExtraProps extends object = Record<string, never>
>({
  theme,
  isInteractive = canvasDefaultProps.isInteractive,
  animate = canvasDefaultProps.animate,
  motionConfig = canvasDefaultProps.motionConfig,
  renderWrapper,
  ...otherProps
}: HeatMapCanvasProps<Datum, ExtraProps>) => (
  <Container
    {...{ isInteractive, animate, motionConfig, theme, renderWrapper }}
  >
    <InnerHeatMapCanvas<Datum, ExtraProps>
      isInteractive={isInteractive}
      {...otherProps}
    />
  </Container>
);

export const AxesStickyXAxis = memo(
  <X extends ScaleValue, Y extends ScaleValue>({
    xScale,
    yScale,
    width,
    height,
    top,
    right,
    bottom,
    left,
    axisOffset,
    sticky,
  }: {
    xScale: AnyScale;
    yScale: AnyScale;
    width: number;
    height: number;
    top?: AxisProps<X> | null;
    right?: AxisProps<Y> | null;
    bottom?: AxisProps<X> | null;
    left?: AxisProps<Y> | null;
    sticky?: boolean | null;
    axisOffset?: number | null;
  }) => {
    const axes: any = { top, right, bottom, left };

    return (
      <>
        {["top", "right", "bottom", "left"].map((position) => {
          const axis = axes[position] as typeof position extends
            | "bottom"
            | "top"
            ? AxisProps<X> | undefined
            : AxisProps<Y> | undefined;

          if (!axis) return null;

          const isXAxis = position === "top" || position === "bottom";
          const ticksPosition =
            position === "top" || position === "left" ? "before" : "after";
          const innerOffset = position === "top" && sticky ? axisOffset : 0;

          return (
            <>
              <Axis
                key={position}
                {...axis}
                axis={isXAxis ? "x" : "y"}
                x={position === "right" ? width : 0}
                y={position === "bottom" ? height : 0 + (innerOffset || 0)}
                scale={isXAxis ? xScale : yScale}
                length={isXAxis ? width : height}
                ticksPosition={ticksPosition}
              />
            </>
          );
        })}
      </>
    );
  }
);

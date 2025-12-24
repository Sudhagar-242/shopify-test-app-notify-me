import { buildChartComponentData } from "app/builders/chart_component_builders";
import { ChartComponentDataType } from "app/types/chart_component";
import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LegendPayload,
} from "recharts";

export default function ChartComponent({
  chartData,
}: {
  chartData: ChartComponentDataType;
}) {
  const [hoveringDataKey, setHoveringDataKey] = useState<string | undefined>();
  const [linesOpacity, setLinesOpacity] = useState({
    Val_Opacity: 1,
    Prev_Opacity: 1,
  });

  useEffect(() => {
    if (hoveringDataKey === "value") {
      setLinesOpacity({ Val_Opacity: 1, Prev_Opacity: 0 });
    } else if (hoveringDataKey === "previous") {
      setLinesOpacity({ Val_Opacity: 0, Prev_Opacity: 1 });
    } else {
      setLinesOpacity({ Val_Opacity: 1, Prev_Opacity: 1 });
    }
  }, [hoveringDataKey]);

  const handleMouseEnter = (payload: LegendPayload) => {
    setHoveringDataKey(payload.dataKey as string);
    console.log(payload);
  };

  const handleMouseLeave = () => {
    setHoveringDataKey(undefined);
  };

  console.log(
    "Chart Component Data: ",
    chartData,
    chartData.backInStockNotificationschart,
    buildChartComponentData(chartData?.backInStockNotificationschart, 7),
  );

  return (
    <div className="p-5 bg-white rounded-xl shadow-md w-full chart-no-focus">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={264}>
        <LineChart
          accessibilityLayer
          data={buildChartComponentData(
            chartData?.backInStockNotificationschart,
            chartData?.backInStockNotificationschart?.labels.length,
          )}
          margin={{ top: 20, bottom: 20, right: 20, left: -20 }}
          syncMethod={"index"}
        >
          {/* Grid */}
          <CartesianGrid stroke="#e5e5e5" vertical={false} strokeWidth={1} />

          {/* X-Axis */}
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickCount={1}
            tickMargin={10}
            interval={"equidistantPreserveStart"}
          />

          {/* Y-Axis - with spacing and padding */}
          <YAxis
            axisLine={false}
            tickSize={20}
            tickLine={{
              color: "#e5e5e5",
              stroke: "#e5e5e5",
              strokeWidth: 1,
            }}
            tickMargin={10}
          />

          {/* <Legend
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          /> */}

          <Legend
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          {/* Solid Line – 7 days */}
          <Line
            type="bump"
            dataKey="value"
            stroke="#0080FF"
            strokeWidth={1}
            legendType="plainline"
            dot={false}
            style={{
              opacity: linesOpacity.Val_Opacity,
            }}
          />

          {/* Dashed Line – Previous */}
          <Line
            type="bump"
            dataKey="previous"
            stroke="#0080FF"
            strokeWidth={1}
            strokeDasharray="3 3"
            legendType="plainline"
            dot={false}
            opacity={linesOpacity.Prev_Opacity}
          />

          {/* Tooltip */}
          <Tooltip
            animationDuration={500}
            animationEasing="ease-in-out"
            cursor={{
              stroke: "#cbcbcf",
              strokeWidth: 1.5,
              opacity: 1,
              style: {
                transition: "all 150ms ease-in-out",
              },
            }}
            contentStyle={{
              background: "white",
              padding: "10px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid #eee",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      {/* <ShopifyHoverChart
        data={buildChartComponentData(
          chartData.backInStockNotificationschart,
          chartData?.backInStockNotificationschart?.labels.length,
        )}
      />
      <ShopifyAnalyticsChart
        data={buildChartComponentData(
          chartData.backInStockNotificationschart,
          chartData?.backInStockNotificationschart?.labels.length,
        )}
      />
      <MovingDotShopifyChart
        data={buildChartComponentData(
          chartData.backInStockNotificationschart,
          chartData?.backInStockNotificationschart?.labels.length,
        )}
      />
      <MovingDotAlongLine
        data={buildChartComponentData(
          chartData.backInStockNotificationschart,
          chartData?.backInStockNotificationschart?.labels.length,
        )}
      />

      <SmoothHoverLineChart /> */}
    </div>
  );
}

function renderLegend(props) {
  const { payload } = props;

  return (
    <ul>
      {payload.map((entry, index) => (
        <li key={`item-${index}`}>{entry.value}</li>
      ))}
    </ul>
  );
}

export function ShopifyHoverChart({ data }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  return (
    <div className="bg-transparent rounded-xl w-full relative">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 20, bottom: 20, right: 20, left: -10 }}
          onMouseMove={(state: any) => {
            if (state?.activeCoordinate) {
              setActiveIndex(state.activeTooltipIndex);
              setCursorX(state.activeCoordinate.x);
            }
          }}
          onMouseLeave={() => {
            setActiveIndex(null);
            setCursorX(null);
          }}
        >
          <CartesianGrid stroke="#e5e5e5" vertical={false} />

          <XAxis dataKey="date" axisLine={false} tickLine={false} />

          <YAxis axisLine={false} tickLine={false} />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#0080FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="previous"
            stroke="#0080FF"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />

          <Tooltip
            cursor={false}
            contentStyle={{
              background: "white",
              borderRadius: 10,
              border: "1px solid #eaeaea",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Shopify-style hover vertical line */}
      {/* {cursorX !== null && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: cursorX,
                        width: "1.5px",
                        background: "rgba(0,0,0,0.15)",
                        pointerEvents: "none",
                        transition: "left 200ms ease-out",
                    }}
                ></div>
            )} */}
    </div>
  );
}

export function ShopifyAnalyticsChart({ data }) {
  const [cursor, setCursor] = useState(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  return (
    <div className="relative w-full p-6 bg-white rounded-xl shadow-sm border border-gray-100 select-none font-sans">
      {/* Shopify gradient */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="shopifyBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#008060" stopOpacity="1" />
            <stop offset="100%" stopColor="#00A87E" stopOpacity="0.65" />
          </linearGradient>
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          margin={{ top: 20, left: -10, right: 25, bottom: 10 }}
          onMouseMove={(s: any) => {
            if (s?.activeCoordinate) {
              setCursor(s.activeTooltipIndex);
              setCursorX(s.activeCoordinate.x);
            }
          }}
          onMouseLeave={() => {
            setCursor(null);
            setCursorX(null);
          }}
        >
          <CartesianGrid stroke="#f2f2f2" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: "#6c6c6c", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval="preserveEnd"
          />

          <YAxis
            tick={{ fill: "#6c6c6c", fontSize: 12 }}
            axisLine={false}
            tickLine={{ stroke: "#dcdcdc" }}
            width={40}
          />

          {/* Shopify main sales line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#shopifyBlue)"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              fill: "#008060",
              stroke: "#ffffff",
              strokeWidth: 3,
            }}
            animationDuration={800}
          />

          {/* Shopify comparison line */}
          <Line
            type="monotone"
            dataKey="previous"
            stroke="#9b9b9b"
            strokeDasharray="6 6"
            strokeWidth={2}
            dot={false}
          />

          <Tooltip
            cursor={false}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
                  <div className="text-gray-700 font-medium">{label}</div>
                  <div className="mt-1">
                    <span className="text-gray-500">Value: </span>
                    <span className="text-black font-semibold">
                      {payload[0].value}
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Shopify hover vertical line */}
      {cursorX !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: cursorX,
            width: "2px",
            background: "rgba(0,0,0,0.1)",
            transition: "left 150ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        ></div>
      )}

      {/* Shopify hover background band */}
      {cursorX !== null && (
        <div
          className="absolute top-0 bottom-0 bg-gray-100 pointer-events-none"
          style={{
            left: cursorX - 30,
            width: 60,
            opacity: 0.3,
            transition: "left 150ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        ></div>
      )}
    </div>
  );
}

export function MovingDotShopifyChart({ data }) {
  const chartRef = useRef(null);
  const [dotPos, setDotPos] = useState({ x: null, y: null });

  const handleMouseMove = (e) => {
    if (!chartRef?.current) return;
    const chart = chartRef?.current?.container;

    const path = chart.querySelector(".recharts-line path"); // main line path
    if (!path) return;

    // const pt = path.getPointAtLength(0); // temp to check
    const totalLen = path.getTotalLength();

    const mouseX = e.chartX;

    // compute closest X along the path
    let best = { x: 0, y: 0 };
    let minDist = Infinity;

    // sample the path 200 steps for smooth effect
    for (let i = 0; i <= 200; i++) {
      const pos = path.getPointAtLength((totalLen * i) / 200);
      const dx = Math.abs(mouseX - pos.x);
      if (dx < minDist) {
        minDist = dx;
        best = { x: pos.x, y: pos.y };
      }
    }

    setDotPos(best);
  };

  const handleMouseLeave = () => {
    setDotPos({ x: null, y: null });
  };

  return (
    <div className="relative w-full p-4 bg-white rounded-xl border border-gray-200">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={data}
          ref={chartRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          margin={{ top: 20, right: 20, bottom: 10 }}
        >
          <CartesianGrid stroke="#f2f2f2" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#666" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#666" }}
            axisLine={false}
            tickLine={{ stroke: "#ddd" }}
          />

          <Tooltip cursor={false} />

          <Line
            dataKey="value"
            stroke="#008060"
            strokeWidth={3}
            dot={false}
            className="recharts-line"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* MOVING DOT */}
      {dotPos.x !== null && (
        <div
          style={{
            position: "absolute",
            left: dotPos.x - 5,
            top: dotPos.y - 5,
            width: 12,
            height: 12,
            background: "#008060",
            border: "3px solid white",
            borderRadius: "50%",
            pointerEvents: "none",
            transition: "left 80ms linear, top 80ms linear",
          }}
        />
      )}
    </div>
  );
}

/**
 * MovingDotAlongLine
 * - data: [{ date: 'Dec 1', value: 10, previous: 8 }, ...]
 *
 * Works by:
 * - giving the main <Line> a className "main-line"
 * - locating the path element for that line
 * - sampling the path to find the point whose x is closest to the mouse x (activeCoordinate.x)
 * - placing an absolutely-positioned dot at that SVG (x,y) converted into the component's container coords
 */
export function MovingDotAlongLine({ data }: { data: any[] }) {
  const chartRef = useRef<any>(null); // recharts chart instance
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dot, setDot] = useState<{
    left: number;
    top: number;
    visible: boolean;
  }>({
    left: 0,
    top: 0,
    visible: false,
  });

  // samples controls accuracy vs perf
  const SAMPLE_STEPS = 300; // increase for very complex curves, decrease for perf

  function onMouseMove(state: any) {
    try {
      if (!state?.activeCoordinate) {
        setDot((d) => ({ ...d, visible: false }));
        return;
      }
      const coord = state.activeCoordinate; // {x, y} in SVG/chart coordinates
      const svgContainer = chartRef.current?.container; // the outer container that Recharts exposes
      if (!svgContainer) return;

      // find the svg element inside the recharts container
      const svg = svgContainer.querySelector("svg");
      if (!svg) return;

      // find the path for our main line via className
      // We set className="main-line" on the Line component below -> path.main-line should exist
      const path = svg.querySelector("path.main-line") as SVGPathElement | null;
      if (!path) return;

      const totalLen = path.getTotalLength();
      if (!totalLen || totalLen === 0) return;

      // sample along the path to find the point with closest x to coord.x
      // (binary search might be faster for monotonic x but sampling is robust)
      let bestPoint = { x: 0, y: 0 };
      let bestDist = Infinity;

      for (let i = 0; i <= SAMPLE_STEPS; i++) {
        const pt = path.getPointAtLength((totalLen * i) / SAMPLE_STEPS);
        const dx = Math.abs(pt.x - coord.x);
        if (dx < bestDist) {
          bestDist = dx;
          bestPoint = { x: pt.x, y: pt.y };
        }
      }

      // compute offset between svg coordinate origin and the container (component div)
      const containerRect = containerRef.current?.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      if (!containerRect || !svgRect) return;

      // pt.x/pt.y are relative to the svg's internal coordinate system.
      // Convert to container-relative pixels:
      const offsetX = svgRect.left - containerRect.left;
      const offsetY = svgRect.top - containerRect.top;

      const left = Math.round(bestPoint.x + offsetX);
      const top = Math.round(bestPoint.y + offsetY);

      setDot({ left, top, visible: true });
    } catch (err) {
      // fail silently - don't crash the whole chart
      // console.warn('moving dot error', err);
      setDot((d) => ({ ...d, visible: false }));
    }
  }

  function onMouseLeave() {
    setDot((d) => ({ ...d, visible: false }));
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        background: "white",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          ref={chartRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          margin={{ top: 20, right: 24, bottom: 12, left: 0 }}
        >
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} width={40} />

          <Tooltip cursor={false} />

          {/* main line: give it a known class so we can find the path */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1C9BFF"
            strokeWidth={3}
            dot={false}
            className="main-line"
            animationDuration={600}
          />

          {/* previous dashed line */}
          <Line
            type="monotone"
            dataKey="previous"
            stroke="#9B9B9B"
            strokeWidth={2}
            strokeDasharray="6 6"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* moving dot */}
      {dot.visible && (
        <div
          style={{
            position: "absolute",
            left: dot.left - 7, // center the 14px dot
            top: dot.top - 7,
            width: 14,
            height: 14,
            borderRadius: 14,
            background: "#1C9BFF",
            border: "3px solid #fff",
            boxShadow: "0 4px 12px rgba(28,155,255,0.25)",
            pointerEvents: "none",
            transition: "left 90ms linear, top 90ms linear",
          }}
        />
      )}
    </div>
  );
}

export function SmoothHoverLineChart() {
  const data = [
    { x: 1, y: 20 },
    { x: 2, y: 40 },
    { x: 3, y: 25 },
    { x: 4, y: 60 },
    { x: 5, y: 45 },
  ];

  const [hoverPoint, setHoverPoint] = useState(null);

  const handleMouseMove = (state) => {
    if (!state.isTooltipActive) {
      setHoverPoint(null);
      return;
    }

    const { chartX, chartY } = state;
    setHoverPoint({ x: chartX, y: chartY });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPoint(null)}
      >
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip cursor={false} content={() => null} />
        <Line
          type="monotone"
          dataKey="y"
          stroke="#0084ff"
          strokeWidth={2}
          dot={false}
          activeDot={{
            stroke: "red",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

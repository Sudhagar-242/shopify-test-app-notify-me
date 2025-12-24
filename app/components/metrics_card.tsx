// import React from "react";

// type BadgeTone = "success" | "warning" | "critical";
// type BadgeIcon = "arrow-up" | "arrow-down";

// interface Badge {
//     tone: BadgeTone;
//     icon?: BadgeIcon;
//     text: string;
// }

// interface Metric {
//     title: string;
//     value: string | number;
//     badge?: Badge;
//     href?: string;
// }

// interface MetricsGridProps {
//     metrics: readonly Metric[];
// }

// const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {

//     const generateColumns = (count: number) => {
//         return Array.from({ length: count * 2 - 1 }, (_, i) =>
//             i % 2 === 0 ? "1fr" : "auto"
//         ).join(" ");
//     };

//     return (
//         <s-section padding="base">
//             <s-grid
//                 gridTemplateColumns={`@container (inline-size <= 400px) 1fr, ${generateColumns(metrics.length)}`}
//                 gap="small"
//             >
//                 {metrics.map((metric, index) => (
//                     <Fragment key={metric.title}>
//                         <s-clickable
//                             // href={metric.href || "#"}
//                             paddingBlock="small-400"
//                             paddingInline="small-100"
//                             borderRadius="base"
//                         >
//                             <s-grid gap="small-300">
//                                 <s-heading>{metric.title}</s-heading>
//                                 <s-stack direction="inline" gap="small-200">
//                                     <s-text>{metric.value}</s-text>
//                                     {/* {metric.badge && (
//                                         <s-badge tone={metric.badge.tone} icon={metric.badge.icon}>
//                                             {metric.badge.text}
//                                         </s-badge>
//                                     )} */}
//                                 </s-stack>
//                             </s-grid>
//                         </s-clickable>

//                         {index < metrics.length - 1 && <s-divider direction="block" />}
//                     </Fragment>
//                 ))}
//             </s-grid>
//         </s-section>
//     );
// };

// export default MetricsGrid;

import { MetricsCard } from "app/types/metrics_card";
import React, { Fragment } from "react";

export default function StatsCardGrid({ cards }: { cards: MetricsCard[] }) {
  return (
    <s-section padding="base">
      <s-query-container containerName="metricsCard">
        <s-grid
          gridTemplateColumns="@container metricsCard (inline-size < 400px) 1fr, (400px <= inline-size < 720px) 1fr auto 1fr auto, 1fr auto 1fr auto 1fr auto 1fr"
          gap="small"
        >
          {cards.map((card, index) => (
            <Fragment key={`card-${card.title}`}>
              <s-clickable
                key={card.title}
                href={card.href || ""}
                paddingBlock="small-400"
                paddingInline="small-100"
                borderRadius="base"
                background="strong"
              >
                <s-grid gap="small-300">
                  <s-heading>{card.title}</s-heading>
                  <s-stack direction="inline" gap="small-200">
                    <s-text>{card.value}</s-text>

                    {card.change !== undefined && (
                      <s-badge tone={card.tone} icon={card.icon || undefined}>
                        {card.change}
                      </s-badge>
                    )}
                  </s-stack>
                </s-grid>
              </s-clickable>

              {/* Add divider between items except after last */}
              {index < cards.length - 1 && (
                <s-divider direction="block" color="strong" />
              )}
            </Fragment>
          ))}
        </s-grid>
      </s-query-container>
    </s-section>
  );
}

import React from "react";

type BadgeTone = "success" | "warning" | "critical";
type BadgeIcon = "arrow-up" | "arrow-down";

interface Badge {
    tone: BadgeTone;
    icon?: BadgeIcon;
    text: string;
}

interface Metric {
    title: string;
    value: string | number;
    badge?: Badge;
    href?: string;
}

interface MetricsGridProps {
    metrics: readonly Metric[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {

    const generateColumns = (count: number) => {
        return Array.from({ length: count * 2 - 1 }, (_, i) =>
            i % 2 === 0 ? "1fr" : "auto"
        ).join(" ");
    };

    return (
        <s-section padding="base">
            <s-grid
                gridTemplateColumns={`@container (inline-size <= 400px) 1fr, ${generateColumns(metrics.length)}`}
                gap="small"
            >
                {metrics.map((metric, index) => (
                    <React.Fragment key={metric.title}>
                        <s-clickable
                            // href={metric.href || "#"}
                            paddingBlock="small-400"
                            paddingInline="small-100"
                            borderRadius="base"
                        >
                            <s-grid gap="small-300">
                                <s-heading>{metric.title}</s-heading>
                                <s-stack direction="inline" gap="small-200">
                                    <s-text>{metric.value}</s-text>
                                    {/* {metric.badge && (
                                        <s-badge tone={metric.badge.tone} icon={metric.badge.icon}>
                                            {metric.badge.text}
                                        </s-badge>
                                    )} */}
                                </s-stack>
                            </s-grid>
                        </s-clickable>

                        {index < metrics.length - 1 && <s-divider direction="block" />}
                    </React.Fragment>
                ))}
            </s-grid>
        </s-section>
    );
};

export default MetricsGrid;

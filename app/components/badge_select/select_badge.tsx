import { useState } from "react";
import './select_batch_module.css'

export default function BadgeSelect() {
    const [selected, setSelected] = useState({
        value: "1",
        label: "Today",
        tone: "success",
    });

    const options = [
        { value: "1", label: "Today", tone: "success" },
        { value: "2", label: "Yesterday", tone: "warning" },
        { value: "3", label: "Last 7 days", tone: "info" },
        { value: "4", label: "Last 30 days", tone: "critical", group: "Custom ranges" },
        { value: "5", label: "Last 90 days", tone: "attention", group: "Custom ranges" },
    ];

    return (
        <div className="select-wrapper">
            <select
                value={selected.value}
                onChange={(e) => {
                    const opt = options.find((o) => o.value === e.target.value);
                    setSelected(opt);
                }}
            >
                {options.map((opt, index) => (
                    <>
                        {opt.group && (options[index - 1]?.group !== opt.group) && (
                            <option disabled className="group-label">
                                {opt.group}
                            </option>
                        )}

                        <option value={opt.value} data-tone={opt.tone}>
                            {opt.label}
                        </option>
                    </>
                ))}
            </select>

            {/* Selected badge preview */}
            <span className={`badge ${selected.tone}`}>{selected.label}</span>
        </div>
    );
}

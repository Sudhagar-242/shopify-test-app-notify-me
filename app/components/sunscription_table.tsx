import React, { useMemo, useState } from "react";
import { SubscribersType } from "./subscribers_list";

interface SubscribersTableProps {
    subscribers: SubscribersType[];
}

const ITEMS_PER_PAGE = 10;

const SubscribersTable: React.FC<SubscribersTableProps> = ({ subscribers }) => {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<"email" | "createdAt" | "product_id">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);

    // 🔍 Filter by email/number/product
    const filtered = useMemo(() => {
        return subscribers.filter((sub) => {
            const t = search.toLowerCase();
            return (
                sub.email?.toLowerCase().includes(t) ||
                sub.number.toLowerCase().includes(t) ||
                sub.product_id.toLowerCase().includes(t)
            );
        });
    }, [search, subscribers]);

    // 🔽 Sort system
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let valA = a[sortField] || "";
            let valB = b[sortField] || "";

            if (sortField === "createdAt") {
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            }

            if (sortOrder === "asc") return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
    }, [filtered, sortField, sortOrder]);

    // 📄 Pagination
    const paginated = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return sorted.slice(start, start + ITEMS_PER_PAGE);
    }, [sorted, page]);

    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

    // 🎯 Action handlers (stub)
    const resendEmail = (sub: SubscribersType) => {
        console.log("Resend:", sub.email);
    };

    const deleteSubscriber = (sub: SubscribersType) => {
        console.log("Delete:", sub.id);
    };

    return (
        <s-section padding="none" accessibilityLabel="Subscribers table section">
            <s-table>

                {/* 🔍 Filters row */}
                {/* <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto auto">
                    <s-search-field
                        label="Search"
                        labelAccessibilityVisibility="exclusive"
                        placeholder="Search items"
                        autocomplete="on"
                    /> */}

                {/* Sort button */}
                {/* <s-button
                        icon="sort"
                        variant="secondary"
                        interestFor="sort-tooltip"
                        commandFor="sort-popover"
                        accessibilityLabel="Sort subscribers"
                    />

                    <s-tooltip id="sort-tooltip">
                        <s-text>Sort</s-text>
                    </s-tooltip>

                    <s-popover id="sort-popover">
                        <s-box padding="small">
                            <s-choice-list label="Sort by" name="Sort by">
                                <s-choice
                                    value="email"
                                    selected={sortField === "email"}
                                    onInput={() => setSortField("email")}
                                >
                                    Email
                                </s-choice>
                                <s-choice
                                    value="product_id"
                                    selected={sortField === "product_id"}
                                    onInput={() => setSortField("product_id")}
                                >
                                    Product ID
                                </s-choice>
                                <s-choice
                                    value="createdAt"
                                    selected={sortField === "createdAt"}
                                    onInput={() => setSortField("createdAt")}
                                >
                                    Created Date
                                </s-choice>
                            </s-choice-list>

                            <s-divider marginBlock="small" />

                            <s-choice-list label="Order" name="Order">
                                <s-choice
                                    value="asc"
                                    selected={sortOrder === "asc"}
                                    onInput={() => setSortOrder("asc")}
                                >
                                    Ascending
                                </s-choice>
                                <s-choice
                                    value="desc"
                                    selected={sortOrder === "desc"}
                                    onInput={() => setSortOrder("desc")}
                                >
                                    Descending
                                </s-choice>
                            </s-choice-list>
                        </s-box>
                    </s-popover>
                </s-grid> */}

                {/* Table Header */}
                <s-table-header-row>
                    <s-table-header></s-table-header>
                    <s-table-header listSlot="primary">Products</s-table-header>
                    <s-table-header>Email</s-table-header>
                    <s-table-header>Phone Number</s-table-header>
                    <s-table-header>Created</s-table-header>
                    <s-table-header>Notification Type</s-table-header>
                    <s-table-header>Status</s-table-header>
                </s-table-header-row>

                {/* Table Body */}
                <s-table-body>
                    {paginated.map((sub) => (
                        <s-table-row key={sub.id} clickDelegate={`sub-${sub.id}`}>
                            <s-table-cell>
                                <s-checkbox id={`sub-${sub.id}`} />
                            </s-table-cell>

                            <s-table-cell slot="primary">
                                <s-stack direction="inline" gap="small" alignItems="center">
                                    <s-clickable
                                        href=""
                                        accessibilityLabel="Ocean Sunset puzzle thumbnail"
                                        border="base"
                                        borderRadius="base"
                                        overflow="hidden"
                                        inlineSize="40px"
                                        blockSize="40px"
                                    >
                                        <s-image
                                            objectFit="cover"
                                            src="https://picsum.photos/id/12/80/80"
                                        />
                                    </s-clickable>
                                    <s-link href="">Ocean Sunset</s-link>
                                </s-stack>
                            </s-table-cell>

                            <s-table-cell >{sub.email ?? "—"}</s-table-cell>

                            <s-table-cell>+{sub.country_code} {sub.number}</s-table-cell>

                            <s-table-cell>
                                {new Date(sub.createdAt).toLocaleDateString()}
                            </s-table-cell>

                            <s-table-cell>
                                <s-select>
                                    <s-option value="mail">
                                        <s-badge tone="success">Mail</s-badge>
                                    </s-option>

                                    <s-option value="sms">
                                        <s-badge tone="warning">SMS</s-badge>
                                    </s-option>

                                    <s-option value="whatsapp">
                                        <s-badge tone="info">Whatsapp</s-badge>
                                    </s-option>
                                </s-select>
                            </s-table-cell>


                            <s-table-cell>
                                {sub.is_error ? (
                                    <s-badge tone="critical">Error</s-badge>
                                ) : sub.is_sent ? (
                                    <s-badge tone="success">Sent</s-badge>
                                ) : (
                                    <s-badge tone="neutral">Pending</s-badge>
                                )}
                            </s-table-cell>

                            {/* <s-table-cell>
                                <s-stack direction="inline" gap="small">
                                    <s-button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => resendEmail(sub)}
                                    >
                                        Resend
                                    </s-button>
                                    <s-button
                                        tone="critical"
                                        variant="secondary"
                                        size="small"
                                        onClick={() => deleteSubscriber(sub)}
                                    >
                                        Delete
                                    </s-button>
                                </s-stack>
                            </s-table-cell> */}
                        </s-table-row>
                    ))}
                </s-table-body>

            </s-table>
        </s-section>
    );
};

export default SubscribersTable;

import React from "react";
import SubscribersTable from "./sunscription_table";

export default function SubscribersList({ subscribers }: { subscribers: Record<string, any>[] }) {
    return (
        <s-section padding="none">
            <s-stack gap="small-200">

                {/* Top bar with Search + Sort */}
                <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center" paddingInline="base" paddingBlockStart="base">
                    <s-grid gridTemplateColumns="1fr auto" gap="small-200" alignItems="center">
                        <s-search-field
                            label="Search"
                            labelAccessibilityVisibility="exclusive"
                            placeholder="Search subscribers"
                            autocomplete="on"
                        />

                        <s-select>
                            <s-option value="newest">Email</s-option>
                            <s-option value="oldest">Products</s-option>
                        </s-select>
                    </s-grid>

                    <s-button
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
                                // selected={sortField === "email"}
                                // onInput={() => setSortField("email")}
                                >
                                    Sent
                                </s-choice>
                                <s-choice
                                    value="product_id"
                                // selected={sortField === "product_id"}
                                // onInput={() => setSortField("product_id")}
                                >
                                    Pending
                                </s-choice>
                                <s-choice
                                    value="createdAt"
                                // selected={sortField === "createdAt"}
                                // onInput={() => setSortField("createdAt")}
                                >
                                    Created Date
                                </s-choice>
                            </s-choice-list>

                            <s-divider />

                            <s-choice-list label="Order" name="Order">
                                <s-choice
                                    value="asc"
                                // selected={sortOrder === "asc"}
                                // onInput={() => setSortOrder("asc")}
                                >
                                    Ascending
                                </s-choice>
                                <s-choice
                                    value="desc"
                                // selected={sortOrder === "desc"}
                                // onInput={() => setSortOrder("desc")}
                                >
                                    Descending
                                </s-choice>
                            </s-choice-list>
                        </s-box>
                    </s-popover>

                    {/* <s-select>
                        <s-option value="newest">Newest</s-option>
                        <s-option value="oldest">Oldest</s-option>
                    </s-select>

                    <s-button variant="secondary">Export</s-button>
                    <s-button variant="primary">Export</s-button>
                    <s-button variant="tertiary">Export</s-button> */}
                    {/* <s-button>Hello</s-button> */}
                </s-grid>

                <s-section>
                    <SubscribersTable subscribers={subscribers} />
                </s-section>

            </s-stack>
        </s-section>
    );
}


// {/* Table Header */}
//                 <s-grid
//                     paddingInline="base"
//                     paddingBlock="small-400"
//                     gridTemplateColumns="auto 1fr 1fr 1fr 1fr 1fr auto"
//                     gap="small-200"
//                     alignItems="center"
//                 >
//                     <s-text></s-text>
//                     <s-text>Products</s-text>
//                     <s-text>Email</s-text>
//                     <s-text>Phone</s-text>
//                     <s-text>Created</s-text>
//                     <s-text>Notification Type</s-text>
//                     <s-text>Status</s-text>
//                 </s-grid>

//                 {/* Rows */}
//                 <s-stack>
//                     {subscribers?.map((s, i) => (
//                         <s-clickable
//                             key={s.id}
//                             borderStyle="solid none none none"
//                             border="base"
//                             paddingInline="base"
//                             paddingBlock="small"
//                         >
//                             <s-grid
//                                 gridTemplateColumns="auto 1fr 1fr 1fr 1fr 1fr auto"
//                                 gap="small-200"
//                                 alignItems="center"
//                             >
//                                 <s-checkbox></s-checkbox>

//                                 {/* Products */}
//                                 <s-stack direction="inline" gap="small" alignItems="center">
//                                     <s-clickable
//                                         href=""
//                                         accessibilityLabel="Ocean Sunset puzzle thumbnail"
//                                         border="base"
//                                         borderRadius="base"
//                                         overflow="hidden"
//                                         inlineSize="40px"
//                                         blockSize="40px"
//                                     >
//                                         <s-image
//                                             objectFit="cover"
//                                             src="https://picsum.photos/id/12/80/80"
//                                         />
//                                     </s-clickable>
//                                     <s-link href="">Ocean Sunset</s-link>
//                                 </s-stack>

//                                 {/* Email */}
//                                 <s-text>{s.email || "—"}</s-text>

//                                 {/* Phone */}
//                                 <s-text>{s.number}</s-text>

//                                 {/* CreatedAt */}
//                                 <s-text>{new Date(s.createdAt).toLocaleDateString()}</s-text>

//                                 {/* Notification-Type */}
//                                 <s-select>
//                                     <s-option value="mail">Email</s-option>
//                                     <s-option value="whatsapp">Whatsapp</s-option>
//                                 </s-select>
//                                 {/* <s-badge tone="success">
//                                     {s.variant_id ? "Variant" : "Product"}
//                                 </s-badge> */}

//                                 {/* Status Badge */}
//                                 {s.is_sent ? (
//                                     <s-badge tone="success" icon="check">
//                                         Sent
//                                     </s-badge>
//                                 ) : s.is_error ? (
//                                     <s-badge tone="critical" icon="alert-circle">
//                                         Error
//                                     </s-badge>
//                                 ) : (
//                                     <s-badge tone="warning" icon="circle">
//                                         Pending
//                                     </s-badge>
//                                 )}

//                             </s-grid>
//                         </s-clickable>
//                     ))}
//                 </s-stack>
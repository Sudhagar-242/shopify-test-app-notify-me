import { CallbackEvent } from "@shopify/polaris-types";
import { ActionType } from "app/constants/requests";
import { GetSubscriberResponse, Subscriber } from "app/types/subscribers";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFetcher } from "react-router";

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

interface SearchBarProps {
  searchTerm: string;
  searchExpanded: boolean;
  onSearchChange: (term: string) => void;
  onSearchExpand: () => void;
  onSearchClose: () => void;
}

interface FilterMenuProps {
  filterEmailOpened: boolean;
  filterEmailSent: boolean;
  filterEmailPending: boolean;
  onFilterEmailOpenedChange: (checked: boolean) => void;
  onFilterEmailSentChange: (checked: boolean) => void;
  onFilterEmailPendingChange: (checked: boolean) => void;
}

interface SortMenuProps {
  sortOrder: string;
  onSortChange: (order: string) => void;
}

interface SubmissionsTableProps {
  submissions: Subscriber[];
  loading: boolean;
  selectedIds: string[];
  pageInfo: GetSubscriberResponse["pagination"] | null;
  searchTerm: string;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onNextPage: (pageInfo: GetSubscriberResponse["pagination"]) => void;
  onPreviousPage: (pageInfo: GetSubscriberResponse["pagination"]) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

interface TableRowProps {
  submission: Subscriber;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

type FilterOption = {
  id: string;
  label: string;
  value: string;
};

const FILTER_TABS: FilterOption[] = [
  {
    id: "all-tab",
    label: "All submissions",
    value: "all",
  },
  {
    id: "email-sent-tab",
    label: "Email sent",
    value: "email_sent",
  },
  {
    id: "email-pending-tab",
    label: "Email pending",
    value: "email_pending",
  },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <s-stack id="tabs-stack" direction="inline" gap="small">
      {FILTER_TABS.map(({ id, label, value }) => (
        <s-clickable-chip
          key={id}
          id={id}
          color={activeFilter === value ? "strong" : "base"}
          onClick={() => onFilterChange(value)}
        >
          {label}
        </s-clickable-chip>
      ))}
    </s-stack>
  );
}

function SearchBar({
  searchTerm,
  searchExpanded,
  onSearchChange,
  onSearchExpand,
  onSearchClose,
}: SearchBarProps) {
  return (
    <>
      <s-stack
        id="search-expanded-container"
        direction="inline"
        gap="small"
        alignItems="center"
        justifyContent="space-between"
      >
        {searchExpanded ? (
          <s-stack direction="inline" gap="base">
            <s-box>
              <s-search-field
                id="search-field"
                label="Search"
                labelAccessibilityVisibility="exclusive"
                placeholder="Search by product title or variant title, sku"
                value={searchTerm}
                onInput={(e) => onSearchChange(e.currentTarget.value)}
              />
            </s-box>
            <s-button
              id="search-close-button"
              icon="x"
              onClick={onSearchClose}
            />
          </s-stack>
        ) : (
          <s-button
            id="search-icon-button"
            icon="search"
            onClick={onSearchExpand}
          />
        )}
      </s-stack>
    </>
  );
}

function FilterMenu({
  filterEmailOpened,
  filterEmailSent,
  filterEmailPending,
  onFilterEmailOpenedChange,
  onFilterEmailSentChange,
  onFilterEmailPendingChange,
}: FilterMenuProps) {
  return (
    <s-popover id="filter-options-stack">
      <s-box
        // id="filter-menu-dropdown"
        background="base"
        borderWidth="base"
        borderColor="base"
        borderRadius="base"
        padding="base"
      >
        <s-stack id="filter-menu-stack" gap="base">
          <s-text id="filter-menu-header" type="strong">
            Filter by
          </s-text>
          <s-stack id="filter-options-stack" gap="small">
            <s-text type="strong">Email Status</s-text>
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox
                id="filter-email-opened"
                checked={filterEmailOpened}
                onChange={(e) =>
                  onFilterEmailOpenedChange(e.currentTarget.checked)
                }
              />
              <s-text>Email opened</s-text>
            </s-stack>
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox
                id="filter-email-sent"
                checked={filterEmailSent}
                onChange={(e) =>
                  onFilterEmailSentChange(e.currentTarget.checked)
                }
              />
              <s-text>Email sent</s-text>
            </s-stack>
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-checkbox
                id="filter-email-pending"
                checked={filterEmailPending}
                onChange={(e) =>
                  onFilterEmailPendingChange(e.currentTarget.checked)
                }
              />
              <s-text>Email pending</s-text>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-box>
    </s-popover>
  );
}

type SortOrder = "subscribed" | "ascending" | "descending";

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: "Subscribed", value: "subscribed" },
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
];

export function SortMenu({ sortOrder, onSortChange }: SortMenuProps) {
  function handleChange(e: CallbackEvent<"s-choice-list">) {
    const value = e.currentTarget.values[0] as SortOrder;
    onSortChange(value);
  }

  return (
    <s-popover id="sort-menu-dropdown">
      <s-box
        background="base"
        borderWidth="base"
        borderColor="base"
        borderRadius="base"
        padding="base"
      >
        <s-stack gap="small-500">
          <s-text type="strong">Sort by</s-text>

          <s-stack>
            <s-choice-list
              label="Sort Order"
              labelAccessibilityVisibility="exclusive"
              onChange={handleChange}
            >
              {SORT_OPTIONS.map(({ label, value }) => {
                const isActive = sortOrder === value;
                return (
                  <s-choice
                    key={value}
                    value={value}
                    defaultSelected={isActive}
                  >
                    {label}
                  </s-choice>
                );
              })}
            </s-choice-list>
          </s-stack>
        </s-stack>
      </s-box>
    </s-popover>
  );
}

function TableRow({ submission, index, isSelected, onSelect }: TableRowProps) {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "---";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusTone = (
    status: string,
  ):
    | "success"
    | "info"
    | "warning"
    | "critical"
    | "auto"
    | "neutral"
    | "caution" => {
    if (status === "Email opened") return "success";
    if (status === "Email sent") return "info";
    return "warning";
  };

  return (
    <s-table-row
      id={`submission-row-${index}`}
      key={submission.id}
      clickDelegate="goto_subscriber"
    >
      <s-table-cell id={`cell-checkbox-${index}`}>
        <s-checkbox
          id={`checkbox-${index}`}
          checked={isSelected}
          onChange={(e) => onSelect(submission.id, e.currentTarget.checked)}
          accessibilityLabel={`Select ${submission.email ?? submission?.number}`}
        />
      </s-table-cell>
      <s-table-cell id={`cell-subscriber-${index}`}>
        <s-link id="goto_subscriber" href={submission.id}>
          <s-text type="strong">{submission.email || "---"}</s-text>
        </s-link>
      </s-table-cell>
      <s-table-cell id={`cell-phone-${index}`}>
        <s-text>{submission.number || "---"}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-product-${index}`}>
        <s-text>{submission.product_title || "---"}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-variant-${index}`}>
        <s-text>{submission.variant_title || "---"}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-status-${index}`}>
        <s-badge
          id={`status-badge-${index}`}
          tone={getStatusTone(submission.is_sent ? "Email sent" : "")}
        >
          {submission.is_sent ? "Email Sent" : "Pending"}
        </s-badge>
      </s-table-cell>
      <s-table-cell id={`cell-email-last-sent-${index}`}>
        <s-text color="subdued">{formatDate(submission.updatedAt)}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-subscription-date-${index}`}>
        <s-text color="subdued">{formatDate(submission.createdAt)}</s-text>
      </s-table-cell>
    </s-table-row>
  );
}

function SubmissionsTable({
  submissions,
  loading,
  selectedIds,
  pageInfo,
  searchTerm,
  onSelectAll,
  onSelectRow,
  onNextPage,
  onPreviousPage,
  isAllSelected,
  isIndeterminate,
}: SubmissionsTableProps) {
  return (
    <s-section id="table-section" padding="none">
      <div>
        <s-table
          id="submissions-table"
          paginate={true}
          loading={loading}
          hasNextPage={pageInfo?.hasNextPage}
          hasPreviousPage={pageInfo?.hasPreviousPage}
          onNextPage={() => onNextPage(pageInfo!)}
          onPreviousPage={() => onPreviousPage(pageInfo!)}
        >
          <s-table-header-row id="table-header-row">
            <s-table-header id="header-checkbox">
              <s-checkbox
                id="select-all-checkbox"
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => onSelectAll(e.currentTarget.checked)}
                accessibilityLabel="Select all submissions"
              />
            </s-table-header>
            <s-table-header id="header-subscriber" listSlot="primary">
              Subscriber
            </s-table-header>
            <s-table-header id="header-phone" listSlot="labeled">
              Phone
            </s-table-header>
            <s-table-header id="header-product" listSlot="labeled">
              Product
            </s-table-header>
            <s-table-header id="header-variant" listSlot="labeled">
              Variant
            </s-table-header>
            <s-table-header id="header-status" listSlot="inline">
              Status
            </s-table-header>
            <s-table-header id="header-email-last-sent" listSlot="labeled">
              Email last sent
            </s-table-header>
            <s-table-header id="header-subscription-date" listSlot="labeled">
              Subscription date
            </s-table-header>
          </s-table-header-row>

          <s-table-body id="table-body">
            {submissions.length === 0 && !loading ? (
              <s-table-row id="empty-row">
                <s-table-cell id="empty-cell">
                  <s-text color="subdued">
                    {searchTerm
                      ? "No submissions match your search"
                      : "No submissions found"}
                  </s-text>
                </s-table-cell>
              </s-table-row>
            ) : (
              submissions.map((submission, index) => (
                <TableRow
                  key={submission.id}
                  submission={submission}
                  index={index}
                  isSelected={selectedIds.includes(submission.id)}
                  onSelect={onSelectRow}
                />
              ))
            )}
          </s-table-body>
        </s-table>
      </div>
    </s-section>
  );
}

export default function SubscribersManagement() {
  const [submissions, setSubmissions] = useState<Subscriber[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Subscriber[]>(
    [],
  );
  const [pageInfo, setPageInfo] = useState<
    GetSubscriberResponse["pagination"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>(SORT_OPTIONS[0].value);
  const [searchExpanded, setSearchExpanded] = useState<boolean>(false);
  const [filterEmailOpened, setFilterEmailOpened] = useState<boolean>(false);
  const [filterEmailSent, setFilterEmailSent] = useState<boolean>(false);
  const [filterEmailPending, setFilterEmailPending] = useState<boolean>(false);

  const fetcher = useFetcher<GetSubscriberResponse>();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef(false);

  // Debounced fetch function - DON'T set loading here
  const debouncedFetch = useCallback(
    (page: number, limit: number, order: string) => {
      // Cancel any pending fetch
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Don't queue if already fetching
      if (fetcher.state !== "idle") {
        console.log("Fetch in progress, skipping");
        return;
      }

      console.log("Scheduling fetch for page:", page);

      // Delay the actual fetch
      debounceTimerRef.current = setTimeout(() => {
        // Double-check before submitting
        if (fetcher.state !== "idle") {
          console.log("Fetch started during debounce, skipping");
          return;
        }

        console.log("Actually fetching page:", page);
        fetcher.submit(
          {
            type: ActionType.GET_SUBSCRIBERS,
            skip: page.toString(),
            limit: limit.toString(),
            order,
          },
          {
            method: "POST",
            encType: "application/json",
          },
        );
      }, 300);
    },
    [fetcher.state], // Add fetcher.state as dependency
  );

  // Handle loading state based on fetcher.state instead
  useEffect(() => {
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      setLoading(true);
    }
  }, [fetcher.state]);

  // Handle fetcher data updates
  useEffect(() => {
    if (fetcher.data) {
      console.log("Set Data");
      setSubmissions(fetcher.data.data);
      setPageInfo(fetcher.data.pagination);
      setLoading(false);
    }
  }, [fetcher.data]);

  // Initial fetch - runs only once
  useEffect(() => {
    if (hasFetched.current) return;
    if (fetcher.state !== "idle") return; // Extra guard

    hasFetched.current = true;
    console.log("Initial fetch");

    fetcher.submit(
      {
        type: ActionType.GET_SUBSCRIBERS,
        skip: "1",
        limit: "10",
        order: "desc",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  }, []); // Keep empty - hasFetched ref handles it

  // // Ref to store the debounce timeout
  // const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // // const hasFetched = useRef(false);
  // // Ref to track if initial fetch happened
  // const hasFetched = useRef(false);

  // // Debounced fetch function
  // const debouncedFetch = useCallback(
  //   (page: number, limit: number, order: string) => {
  //     // Cancel any pending fetch
  //     if (debounceTimerRef.current) {
  //       clearTimeout(debounceTimerRef.current);
  //     }

  //     console.log("Inside Debounce");

  //     // Set loading state immediately for UI feedback
  //     setLoading(true);

  //     // Delay the actual fetch by 300ms
  //     debounceTimerRef.current = setTimeout(() => {
  //       fetcher.submit(
  //         {
  //           type: ActionType.GET_SUBSCRIBERS,
  //           skip: page.toString(),
  //           limit: limit.toString(),
  //           order,
  //         },
  //         {
  //           method: "POST",
  //           encType: "application/json",
  //         },
  //       );
  //     }, 500); // 300ms debounce delay
  //   },
  //   [], // No dependencies needed - fetcher is stable
  // );

  // // Cleanup timeout on unmount
  // useEffect(() => {
  //   return () => {
  //     if (debounceTimerRef.current) {
  //       clearTimeout(debounceTimerRef.current);
  //     }
  //   };
  // }, []);

  // // Initial fetch - runs only once
  // useEffect(() => {
  //   if (hasFetched.current) return;
  //   hasFetched.current = true;

  //   console.log("Inside the Initial");

  //   fetcher.submit(
  //     {
  //       type: ActionType.GET_SUBSCRIBERS,
  //       skip: "1",
  //       limit: "10",
  //       order: "desc",
  //     },
  //     {
  //       method: "POST",
  //       encType: "application/json",
  //     },
  //   );
  // }, []);

  // // Handle fetcher data updates
  // useEffect(() => {
  //   if (fetcher.data) {
  //     console.log("Set Data");
  //     setSubmissions(fetcher.data.data);
  //     setPageInfo(fetcher.data.pagination);
  //     setLoading(false);
  //   }
  // }, [fetcher.data]);

  // Updated pagination handlers using debounce
  const handleNextPage = (
    pageInfo: GetSubscriberResponse["pagination"],
  ): void => {
    debouncedFetch(+pageInfo.currentPage + 1, pageInfo.limit, sortOrder);
  };

  const handlePreviousPage = (
    pageInfo: GetSubscriberResponse["pagination"],
  ): void => {
    debouncedFetch(+pageInfo.currentPage - 1, pageInfo.limit, sortOrder);
  };

  useEffect(() => {
    let filtered = [...submissions];

    if (activeFilter === "email_sent") {
      filtered = filtered.filter((s) => s?.is_sent);
    } else if (activeFilter === "email_pending") {
      filtered = filtered.filter((s) => !s?.is_sent);
    }

    if (filterEmailOpened || filterEmailSent || filterEmailPending) {
      filtered = filtered.filter((s) => {
        // if (filterEmailOpened && s.is_sent === "Email opened") return true;
        if (filterEmailSent && s?.is_sent) return true;
        if (filterEmailPending && !s?.is_sent) return true;
        return false;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s?.product_title?.toLowerCase().includes(term) ||
          s?.variant_title?.toLowerCase().includes(term),
      );
    }

    if (sortOrder === "ascending") {
      filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else if (sortOrder === "descending") {
      filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    setFilteredSubmissions(filtered);
  }, [
    submissions,
    activeFilter,
    searchTerm,
    sortOrder,
    filterEmailOpened,
    filterEmailSent,
    filterEmailPending,
  ]);

  // const handleNextPage = (
  //   pageInfo: GetSubscriberResponse["pagination"],
  // ): void => {
  //   fetchPage(
  //     ActionType.GET_SUBSCRIBERS,
  //     +pageInfo.currentPage + 1,
  //     pageInfo.limit,
  //     sortOrder,
  //   );
  // };

  // const handlePreviousPage = (
  //   pageInfo: GetSubscriberResponse["pagination"],
  // ): void => {
  //   fetchPage(
  //     ActionType.GET_SUBSCRIBERS,
  //     +pageInfo.currentPage - 1,
  //     pageInfo.limit,
  //     sortOrder,
  //   );
  // };

  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      setSelectedIds(filteredSubmissions.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean): void => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const isAllSelected = (): boolean => {
    return (
      filteredSubmissions.length > 0 &&
      selectedIds.length === filteredSubmissions.length
    );
  };

  const isIndeterminate = (): boolean => {
    return (
      selectedIds.length > 0 && selectedIds.length < filteredSubmissions.length
    );
  };

  const handleSearchExpand = (): void => {
    setSearchExpanded(true);
  };

  const handleSearchClose = (): void => {
    setSearchTerm("");
    setSearchExpanded(false);
  };

  const handleSortChange = (order: string): void => {
    setSortOrder(order);
  };

  if (error) {
    return (
      <s-section id="main-page" heading="Submissions & Products">
        <s-section id="error-section">
          <s-banner id="error-banner" tone="critical">
            <s-text id="error-text">{error}</s-text>
          </s-banner>
        </s-section>
      </s-section>
    );
  }

  return (
    <s-section id="main-page" padding="base">
      <s-section id="filters-section">
        <s-stack
          id="filters-stack"
          direction="inline"
          gap="base"
          justifyContent="space-between"
        >
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <s-stack
            id="search-filter-stack"
            direction="inline"
            gap="base"
            alignItems="center"
          >
            <SearchBar
              searchTerm={searchTerm}
              searchExpanded={searchExpanded}
              onSearchChange={setSearchTerm}
              onSearchExpand={handleSearchExpand}
              onSearchClose={handleSearchClose}
            />

            <s-button
              id="filter-button"
              commandFor="filter-options-stack"
              icon="filter"
              // onClick={() => setShowFilterMenu(!showFilterMenu)}
            />

            <s-button
              id="sort-menu-trigger"
              icon="sort"
              commandFor="sort-menu-dropdown"
              // onClick={() => setShowSortMenu(!showSortMenu)}
            />
          </s-stack>
        </s-stack>

        <FilterMenu
          filterEmailOpened={filterEmailOpened}
          filterEmailSent={filterEmailSent}
          filterEmailPending={filterEmailPending}
          onFilterEmailOpenedChange={setFilterEmailOpened}
          onFilterEmailSentChange={setFilterEmailSent}
          onFilterEmailPendingChange={setFilterEmailPending}
        />

        <SortMenu sortOrder={sortOrder} onSortChange={handleSortChange} />

        <SubmissionsTable
          submissions={filteredSubmissions}
          loading={loading}
          selectedIds={selectedIds}
          pageInfo={pageInfo}
          searchTerm={searchTerm}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isAllSelected={isAllSelected()}
          isIndeterminate={isIndeterminate()}
        />
      </s-section>
    </s-section>
  );
}

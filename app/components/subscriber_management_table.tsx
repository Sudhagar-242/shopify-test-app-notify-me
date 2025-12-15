import { useState, useEffect } from "react";

interface Submission {
  id: string;
  subscriber: string;
  phone: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  emailStatus: string;
  emailLastSent: string;
  subscriptionDate: string;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
  startCursor: string | null;
}

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
  show: boolean;
  filterEmailOpened: boolean;
  filterEmailSent: boolean;
  filterEmailPending: boolean;
  onFilterEmailOpenedChange: (checked: boolean) => void;
  onFilterEmailSentChange: (checked: boolean) => void;
  onFilterEmailPendingChange: (checked: boolean) => void;
}

interface SortMenuProps {
  show: boolean;
  sortOrder: string;
  onSortChange: (order: string) => void;
}

interface SubmissionsTableProps {
  submissions: Submission[];
  loading: boolean;
  selectedIds: string[];
  pageInfo: PageInfo | null;
  searchTerm: string;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

interface TableRowProps {
  submission: Submission;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <s-stack id="tabs-stack" direction="inline" gap="small">
      <s-clickable-chip
        id="all-tab"
        color={activeFilter === "all" ? "strong" : "base"}
        onClick={() => onFilterChange("all")}
      >
        All submissions
      </s-clickable-chip>
      <s-clickable-chip
        id="email-sent-tab"
        color={activeFilter === "email_sent" ? "strong" : "base"}
        onClick={() => onFilterChange("email_sent")}
      >
        Email sent
      </s-clickable-chip>
      <s-clickable-chip
        id="email-pending-tab"
        color={activeFilter === "email_pending" ? "strong" : "base"}
        onClick={() => onFilterChange("email_pending")}
      >
        Email pending
      </s-clickable-chip>
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
      {searchExpanded ? (
        <s-stack
          id="search-expanded-container"
          direction="inline"
          gap="small"
          alignItems="center"
        >
          <s-search-field
            id="search-field"
            label="Search"
            labelAccessibilityVisibility="exclusive"
            placeholder="Search by product title or variant title, sku"
            value={searchTerm}
            onInput={(e) => onSearchChange(e.currentTarget.value)}
          />
          <s-button id="search-close-button" icon="x" onClick={onSearchClose} />
        </s-stack>
      ) : (
        <s-button
          id="search-icon-button"
          icon="search"
          onClick={onSearchExpand}
        />
      )}
    </>
  );
}

function FilterMenu({
  show,
  filterEmailOpened,
  filterEmailSent,
  filterEmailPending,
  onFilterEmailOpenedChange,
  onFilterEmailSentChange,
  onFilterEmailPendingChange,
}: FilterMenuProps) {
  if (!show) return null;

  return (
    <s-box
      id="filter-menu-dropdown"
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
              onChange={(e) => onFilterEmailSentChange(e.currentTarget.checked)}
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
  );
}

function SortMenu({ show, sortOrder, onSortChange }: SortMenuProps) {
  if (!show) return null;

  return (
    <s-box
      id="sort-menu-dropdown"
      background="base"
      borderWidth="base"
      borderColor="base"
      borderRadius="base"
      padding="base"
    >
      <s-stack id="sort-menu-stack" gap="base">
        <s-text id="sort-menu-header" type="strong">
          Sort by
        </s-text>
        <s-stack id="sort-options-stack" gap="small">
          <s-clickable
            id="sort-option-subscribed"
            onClick={() => onSortChange("subscribed")}
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text type={sortOrder === "subscribed" ? "strong" : "generic"}>
                {sortOrder === "subscribed" ? "●" : "○"} Subscribed
              </s-text>
            </s-stack>
          </s-clickable>
          <s-clickable
            id="sort-option-ascending"
            onClick={() => onSortChange("ascending")}
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text type={sortOrder === "ascending" ? "strong" : "generic"}>
                {sortOrder === "ascending" ? "●" : "○"} Ascending
              </s-text>
            </s-stack>
          </s-clickable>
          <s-clickable
            id="sort-option-descending"
            onClick={() => onSortChange("descending")}
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-text type={sortOrder === "descending" ? "strong" : "generic"}>
                {sortOrder === "descending" ? "●" : "○"} Descending
              </s-text>
            </s-stack>
          </s-clickable>
        </s-stack>
      </s-stack>
    </s-box>
  );
}

function TableRow({ submission, index, isSelected, onSelect }: TableRowProps) {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
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
    <s-table-row id={`submission-row-${index}`} key={submission.id}>
      <s-table-cell id={`cell-checkbox-${index}`}>
        <s-checkbox
          id={`checkbox-${index}`}
          checked={isSelected}
          onChange={(e) => onSelect(submission.id, e.currentTarget.checked)}
          accessibilityLabel={`Select ${submission.subscriber}`}
        />
      </s-table-cell>
      <s-table-cell id={`cell-subscriber-${index}`}>
        <s-text type="strong">{submission.subscriber}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-phone-${index}`}>
        <s-text>{submission.phone || "—"}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-product-${index}`}>
        <s-text>{submission.productTitle}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-variant-${index}`}>
        <s-text>{submission.variantTitle}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-status-${index}`}>
        <s-badge
          id={`status-badge-${index}`}
          tone={getStatusTone(submission.emailStatus)}
        >
          {submission.emailStatus}
        </s-badge>
      </s-table-cell>
      <s-table-cell id={`cell-email-last-sent-${index}`}>
        <s-text color="subdued">{formatDate(submission.emailLastSent)}</s-text>
      </s-table-cell>
      <s-table-cell id={`cell-subscription-date-${index}`}>
        <s-text color="subdued">
          {formatDate(submission.subscriptionDate)}
        </s-text>
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
      <s-table
        id="submissions-table"
        paginate={true}
        loading={loading}
        hasNextPage={pageInfo?.hasNextPage || false}
        hasPreviousPage={pageInfo?.hasPreviousPage || false}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
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
    </s-section>
  );
}

export default function SubscribersMAnagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    [],
  );
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("subscribed");
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [searchExpanded, setSearchExpanded] = useState<boolean>(false);
  const [filterEmailOpened, setFilterEmailOpened] = useState<boolean>(false);
  const [filterEmailSent, setFilterEmailSent] = useState<boolean>(false);
  const [filterEmailPending, setFilterEmailPending] = useState<boolean>(false);

  useEffect(() => {
    loadExampleData();
  }, []);

  const loadExampleData = (): void => {
    const exampleSubmissions: Submission[] = [
      {
        id: "1",
        subscriber: "babu@amwhiz.com",
        phone: "+918825881698",
        productId: "gid://shopify/Product/1",
        productTitle: "Biodegradable cardboard pots",
        variantTitle: "Default Title",
        emailStatus: "Email opened",
        emailLastSent: "2024-12-11T16:12:00Z",
        subscriptionDate: "2024-12-11T00:00:00Z",
      },
      {
        id: "2",
        subscriber: "heisenberggus@proton.me",
        phone: "+917428723247",
        productId: "gid://shopify/Product/2",
        productTitle: "Poster 1 (varying landscape image aspect ratios)",
        variantTitle: "16:9",
        emailStatus: "Email opened",
        emailLastSent: "2024-12-10T23:35:00Z",
        subscriptionDate: "2024-12-11T00:00:00Z",
      },
      {
        id: "3",
        subscriber: "sudhagar@amwhiz.com",
        phone: "+916379890750",
        productId: "gid://shopify/Product/3",
        productTitle: "Socks (2 options)",
        variantTitle: "Paw / Kids",
        emailStatus: "Email sent",
        emailLastSent: "2024-12-09T14:14:00Z",
        subscriptionDate: "2024-12-09T00:00:00Z",
      },
      {
        id: "4",
        subscriber: "ledem61349@lavior.com",
        phone: "",
        productId: "gid://shopify/Product/4",
        productTitle: "Knitted Throw Pillows",
        variantTitle: "Default Title",
        emailStatus: "Email pending",
        emailLastSent: "",
        subscriptionDate: "2024-12-08T00:00:00Z",
      },
    ];

    setSubmissions(exampleSubmissions);
    setPageInfo({
      hasNextPage: false,
      hasPreviousPage: false,
      endCursor: null,
      startCursor: null,
    });
    setLoading(false);
  };

  useEffect(() => {
    let filtered = [...submissions];

    if (activeFilter === "email_sent") {
      filtered = filtered.filter((s) => s.emailStatus === "Email sent");
    } else if (activeFilter === "email_pending") {
      filtered = filtered.filter((s) => s.emailStatus === "Email pending");
    }

    if (filterEmailOpened || filterEmailSent || filterEmailPending) {
      filtered = filtered.filter((s) => {
        if (filterEmailOpened && s.emailStatus === "Email opened") return true;
        if (filterEmailSent && s.emailStatus === "Email sent") return true;
        if (filterEmailPending && s.emailStatus === "Email pending")
          return true;
        return false;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.productTitle.toLowerCase().includes(term) ||
          s.variantTitle.toLowerCase().includes(term),
      );
    }

    if (sortOrder === "ascending") {
      filtered.sort((a, b) =>
        a.subscriptionDate.localeCompare(b.subscriptionDate),
      );
    } else if (sortOrder === "descending") {
      filtered.sort((a, b) =>
        b.subscriptionDate.localeCompare(a.subscriptionDate),
      );
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

  const handleNextPage = (): void => {};

  const handlePreviousPage = (): void => {};

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
    setShowSortMenu(false);
  };

  if (error) {
    return (
      <s-section
        id="main-page"
        heading="Submissions & Products"
        inlineSize="large"
      >
        <s-section id="error-section">
          <s-banner id="error-banner" tone="critical">
            <s-text id="error-text">{error}</s-text>
          </s-banner>
        </s-section>
      </s-section>
    );
  }

  return (
    <s-section
      id="main-page"
      heading="Submissions & Products"
      inlineSize="large"
    >
      <s-button-group slot="secondary-actions" id="header-actions">
        <s-button id="products-view-button" icon="product">
          Products view
        </s-button>
        <s-button id="export-button" icon="export">
          Export
        </s-button>
        <s-button id="import-button" icon="import">
          Import
        </s-button>
        <s-button id="add-subscriber-button" variant="primary" icon="plus">
          Add subscriber
        </s-button>
      </s-button-group>

      <s-section id="filters-section">
        <s-stack id="filters-stack" direction="block" gap="base">
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
              icon="filter"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            />

            <s-button
              id="sort-menu-trigger"
              icon="sort"
              onClick={() => setShowSortMenu(!showSortMenu)}
            />
          </s-stack>
        </s-stack>

        <FilterMenu
          show={showFilterMenu}
          filterEmailOpened={filterEmailOpened}
          filterEmailSent={filterEmailSent}
          filterEmailPending={filterEmailPending}
          onFilterEmailOpenedChange={setFilterEmailOpened}
          onFilterEmailSentChange={setFilterEmailSent}
          onFilterEmailPendingChange={setFilterEmailPending}
        />

        <SortMenu
          show={showSortMenu}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

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

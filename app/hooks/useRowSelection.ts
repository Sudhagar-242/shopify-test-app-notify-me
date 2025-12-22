import { useCallback, useMemo, useState } from "react";

export function useRowSelection(items: { id: string }[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items, selectedIds],
  );

  const isIndeterminate = useMemo(
    () => selectedIds.length > 0 && selectedIds.length < items.length,
    [items, selectedIds],
  );

  const selectAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? items.map((i) => i.id) : []);
  }, [items]);

  const selectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }, []);

  return {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    selectAll,
    selectOne,
  };
}

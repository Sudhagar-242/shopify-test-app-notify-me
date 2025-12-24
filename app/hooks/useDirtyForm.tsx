import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Primitive = string | number | boolean | null | undefined | symbol | bigint;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Primitive ? T[K] : DeepPartial<T[K]>;
};

type DirtyFields<T> = {
  [K in keyof T]?: boolean;
};

function isEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isEqual(v, b[i]));
  }

  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => isEqual(a[key], b[key]));
}

export function useDirtyForm<T extends Record<string, unknown>>(
  initialData: T,
) {
  const initialRef = useRef<T>(initialData);
  const [values, setValues] = useState<T>(initialData);
  const [dirtyFields, setDirtyFields] = useState<DirtyFields<T>>({});

  // Handle async initial values (edit form)
  useEffect(() => {
    initialRef.current = initialData;
    setValues(initialData);
    setDirtyFields({});
  }, [initialData]);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });

    const isFieldDirty = !isEqual(initialRef.current[key], value);

    setDirtyFields((prev) => ({
      ...prev,
      [key]: isFieldDirty || undefined,
    }));
  }, []);

  const isDirty = useMemo(
    () => Object.values(dirtyFields).some(Boolean),
    [dirtyFields],
  );

  const markSaved = useCallback(
    (updated?: DeepPartial<T>) => {
      const next = {
        ...values,
        ...updated,
      } as T;

      initialRef.current = next;
      setValues(next);
      setDirtyFields({});
    },
    [values],
  );

  const discardChanges = useCallback(() => {
    setValues(initialRef.current);
    setDirtyFields({});
  }, []);

  const reset = useCallback((newInitial?: T) => {
    const base = newInitial ?? initialRef.current;
    initialRef.current = base;
    setValues(base);
    setDirtyFields({});
  }, []);

  return {
    values,
    savedData: initialRef.current,
    setValues,
    setField,
    dirtyFields,
    isDirty,
    markSaved,
    discardChanges,
    reset,
  } as const;
}

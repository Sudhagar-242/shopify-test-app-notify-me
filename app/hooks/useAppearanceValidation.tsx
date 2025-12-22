import { ButtonStyleValues } from "app/components/form_components/button_style_editor";
import {
  AppearanceForm,
  validateAppearance,
} from "app/routes/app.requests._index";
import { useMemo } from "react";

export type FieldError = string | undefined;

type DynamicFieldFieldErrors = {
  label?: string;
  placeholder?: string;
  options?: string;
  value?: string;
};

export type DynamicFieldErrors = Record<string, DynamicFieldFieldErrors>;

export type AppearanceErrors = {
  product_detail?: FieldError;
  notify_me?: Partial<Record<keyof ButtonStyleValues, FieldError>>;
  subscribe?: Partial<Record<keyof ButtonStyleValues, FieldError>>;
  footer?: FieldError;
  fields?: DynamicFieldErrors;
};

export function useAppearanceValidation(values: AppearanceForm) {
  const errors = useMemo(() => validateAppearance(values), [values]);

  const isValid = useMemo(() => {
    const has = (obj?: any): boolean =>
      !!obj && (typeof obj === "string" ? true : Object.values(obj).some(has));

    return !has(errors);
  }, [errors]);

  return { errors, isValid };
}

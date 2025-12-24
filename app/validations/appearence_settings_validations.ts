import { DynamicFieldConfig } from "app/components/form_builder/edit_card";
import { ButtonStyleValues } from "app/components/form_components/button_style_editor";
import {
  AppearanceErrors,
  FieldError,
  DynamicFieldErrors,
} from "app/hooks/useAppearanceValidation";
import { AppearanceForm } from "app/routes/app.requests._index";

export function validateAppearance(values: AppearanceForm): AppearanceErrors {
  return {
    product_detail: validateProductDetail(values?.product_detail_show),
    notify_me: validateButton(values.notify_me),
    subscribe: validateButton(values.subscribe),
    footer: validateFooter(values.footer),
    fields: validateDynamicFields(values.fields),
  };
}

export function validateProductDetail(value: string): FieldError {
  return value ? undefined : "Please select a display option";
}

export function validateFooter(value: string): FieldError {
  if (!value.trim()) return "Footer cannot be empty";
  if (value.length > 200) return "Footer must be under 200 characters";
  return undefined;
}

export function validateButton(
  btn: ButtonStyleValues,
): AppearanceErrors["notify_me"] {
  const errors: Partial<Record<keyof ButtonStyleValues, FieldError>> = {};

  if (btn.fontSize < 12 || btn.fontSize > 30) {
    errors.fontSize = "Font size must be between 12 and 30";
  }

  if (btn.padding < 0 || btn.padding > 40) {
    errors.padding = "Padding must be between 0 and 40";
  }

  if (btn.borderCorner < 0 || btn.borderCorner > 20) {
    errors.borderCorner = "Border radius must be between 0 and 20";
  }

  return Object.keys(errors).length ? errors : undefined;
}

export function validateDynamicFields(
  fields: DynamicFieldConfig[],
): DynamicFieldErrors | undefined {
  const errors: DynamicFieldErrors = {};

  for (const field of fields) {
    const fieldErrors: DynamicFieldErrors["x"] = {};

    // Base validation (all fields)
    if (!field.label.trim()) {
      fieldErrors.label = "Label is required";
    }

    // Type-specific validation
    switch (field.type) {
      case "text":
      case "textarea":
        if (field.required && !field.placeholder.trim()) {
          fieldErrors.placeholder = "Placeholder is required";
        }
        break;

      case "select":
      case "checkbox":
      case "radio":
        if (!field.options.trim()) {
          fieldErrors.options = "At least one option is required";
        }
        break;

      case "terms":
        if (!field.value.trim()) {
          fieldErrors.value = "Terms text cannot be empty";
        }
        break;
    }

    // Attach only if errors exist
    if (Object.keys(fieldErrors).length > 0) {
      errors[field.id] = fieldErrors;
    }
  }

  return Object.keys(errors).length ? errors : undefined;
}

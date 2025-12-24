import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Expandable from "../expandable";
import { CallbackEvent } from "@shopify/polaris-types";

export type BaseDynamicFieldConfig = {
  id: string;
  type: Field["type"];
  label: string;
  showLabel: boolean;
  required: boolean;
};

export type TextConfig = BaseDynamicFieldConfig & {
  type: "text" | "textarea";
  placeholder: string;
};

export type SelectConfig = BaseDynamicFieldConfig & {
  type: "select";
  placeholder: string;
  options: string; // CSV or newline
  defaultValue: string;
};

export type CheckboxConfig = BaseDynamicFieldConfig & {
  type: "checkbox" | "radio";
  options: string;
  defaultValue: string;
};

export type TermsConfig = BaseDynamicFieldConfig & {
  type: "terms";
  value: string;
  defaultSelected: boolean;
};

export type DynamicFieldConfig =
  | TextConfig
  | SelectConfig
  | CheckboxConfig
  | TermsConfig;

// Field type definitions
type TextField = {
  type: "text";
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
};

type TextAreaField = {
  type: "textarea";
  name: string;
  label: string;
  value?: string;
};

type CheckboxField = {
  type: "checkbox";
  name: string;
  label: string;
  checked?: boolean;
};

type SelectField = {
  type: "select";
  name: string;
  label: string;
  options?: string; // newline separated options or CSV
  defaultValue?: string;
};

type RadioField = {
  type: "radio";
  name: string;
  label: string;
  options?: string;
  defaultValue?: string;
};

type TermsField = {
  type: "terms";
  name: string;
  label: string;
  value?: string;
  defaultSelected?: boolean;
};

type Field =
  | TextField
  | TextAreaField
  | CheckboxField
  | SelectField
  | RadioField
  | TermsField;

const TEXT_FIELDS = (
  label: string,
  showLabel: boolean,
  placeholder: string,
  required: boolean,
): Field[] => [
  { type: "text", name: "Text", label: "Label", value: label },
  {
    type: "text",
    name: "Placeholder",
    label: "Placeholder",
    value: placeholder,
  },
  {
    type: "checkbox",
    name: "ShowLabel",
    label: "Show Label",
    checked: showLabel,
  },
  { type: "checkbox", name: "Required", label: "Required", checked: required },
];

const TEXTAREA_FIELDS = (
  label: string,
  showLabel: boolean,
  placeholder: string,
  required: boolean,
): Field[] => [
  { type: "text", name: "Text", label: "Text", value: label },
  {
    type: "text",
    name: "Placeholder",
    label: "Placeholder",
    value: placeholder,
  },
  {
    type: "checkbox",
    name: "ShowLabel",
    label: "Show Label",
    checked: showLabel,
  },
  { type: "checkbox", name: "Required", label: "Required", checked: required },
];

const SELECT_FIELDS = (
  label: string,
  showLabel: boolean,
  placeholder: string,
  option: string,
  defaultValues: string,
  required: boolean,
): Field[] => [
  { type: "text", name: "Text", label: "Label", value: label },
  {
    type: "text",
    name: "Placeholder",
    label: "Placeholder",
    value: placeholder,
  },
  {
    type: "checkbox",
    name: "ShowLabel",
    label: "Show Label",
    checked: showLabel,
  },
  { type: "textarea", name: "Options", label: "Options", value: option },
  {
    type: "select",
    name: "default_selected",
    label: "Default Selected",
    options: option,
    defaultValue: defaultValues,
  },
  { type: "checkbox", name: "Required", label: "Required", checked: required },
];

const CHECKBOX_FIELDS = (
  label: string,
  showLabel: boolean,
  options: string,
  defaultValues: string,
  required: boolean,
): Field[] => [
  { type: "text", name: "Text", label: "Label", value: label },
  {
    type: "checkbox",
    name: "ShowLabel",
    label: "Show Label",
    checked: showLabel,
  },
  { type: "textarea", name: "Options", label: "Options", value: options },
  {
    type: "textarea",
    name: "Default",
    label: "Default Value",
    value: defaultValues,
  },
  { type: "checkbox", name: "Required", label: "Required", checked: required },
];

const RADIO_FIELDS = (
  label: string,
  showLabel: boolean,
  options: string,
  defaultValues: string,
  required: boolean,
): Field[] => [
  { type: "text", name: "Text", label: "Label", value: label },
  {
    type: "checkbox",
    name: "ShowLabel",
    label: "Show Label",
    checked: showLabel,
  },
  { type: "textarea", name: "Options", label: "Options", value: options },
  {
    type: "select",
    name: "default_selected",
    label: "Default Selected",
    options: options,
    defaultValue: defaultValues,
  },
  { type: "checkbox", name: "Required", label: "Required", checked: required },
];

const TERMS_FIELDS = (
  label: string,
  value: string,
  defaultSelected: boolean,
  required: boolean,
): Field[] => [
  { type: "text", name: "Text", label: "Label", value: label },
  { type: "text", name: "Value", label: "Value", value },
  {
    type: "terms",
    name: "Default",
    label: "Default Selected",
    defaultSelected,
  },
  { type: "checkbox", name: "Required", label: "Required", checked: required },
];

export type DynamicFieldFieldErrors = {
  label?: string;
  placeholder?: string;
  options?: string;
  value?: string;
};

export type DynamicFieldErrors = Record<
  string, // field.id
  DynamicFieldFieldErrors
>;

interface FieldRendererProps {
  fields: Field[];
  onChange: (name: string, value: any) => void;
  errors?: DynamicFieldFieldErrors;
}

const FIELD_KEY_MAP: Record<string, keyof DynamicFieldConfig> = {
  Text: "label",
  Placeholder: "placeholder",
  Options: "options",
  Required: "required",
  ShowLabel: "showLabel",
  Default: "defaultValue",
  default_selected: "defaultValue",
  Value: "value",
};

function FieldRenderer({ fields, onChange, errors }: FieldRendererProps) {
  return (
    <>
      {fields.map((field, index) => {
        switch (field.type) {
          case "text": {
            const f = field as TextField;
            const errorKey = FIELD_KEY_MAP[
              f.name
            ] as unknown as DynamicFieldErrors;
            return (
              <s-text-field
                key={index}
                name={f.name}
                label={f.label}
                value={f.value}
                placeholder={f.placeholder}
                onChange={(e: any) => onChange(f.name, e.currentTarget.value)}
                error={errorKey ? errors?.[errorKey] : undefined}
                required={true}
              />
            );
          }

          case "textarea": {
            const f = field as TextAreaField;
            const errorKey = FIELD_KEY_MAP[
              f.name
            ] as unknown as DynamicFieldErrors;
            return (
              <s-text-area
                key={index}
                name={f.name}
                label={f.label}
                value={f.value}
                onInput={(e: any) => onChange(f.name, e.currentTarget.value)}
                error={errorKey ? errors?.[errorKey] : undefined}
                required={true}
              />
            );
          }

          case "checkbox": {
            const f = field as CheckboxField;
            const errorKey = FIELD_KEY_MAP[
              f.name
            ] as unknown as DynamicFieldErrors;
            return (
              <s-checkbox
                key={index}
                name={f.name}
                label={f.label}
                checked={Boolean(f.checked)}
                onInput={(e: any) => onChange(f.name, e.currentTarget.checked)}
                error={errorKey ? errors?.[errorKey] : undefined}
              />
            );
          }

          case "select": {
            const f = field as SelectField;
            const errorKey = FIELD_KEY_MAP[
              f.name
            ] as unknown as DynamicFieldErrors;
            return (
              <s-select
                key={index}
                id={`select-${f.name}`}
                label={f.label}
                onInput={(e: any) => onChange(f.name, e.currentTarget.value)}
                error={errorKey ? errors?.[errorKey] : undefined}
              >
                <s-option
                  value={"none"}
                  defaultSelected={field?.defaultValue === "none"}
                ></s-option>
                {(f.options || "").split(/\r?\n|,/).map((opt, i) => (
                  <s-option
                    key={i}
                    value={opt.trim()}
                    defaultSelected={field?.defaultValue === opt?.trim()}
                  >
                    {opt.trim()}
                  </s-option>
                ))}
              </s-select>
            );
          }

          case "radio": {
            const f = field as RadioField;
            const errorKey = FIELD_KEY_MAP[
              f.name
            ] as unknown as DynamicFieldErrors;
            return (
              <s-choice-list
                label={f.label}
                name={f.name}
                onInput={(e: any) => onChange(f.name, e.currentTarget.value)}
                error={errorKey ? errors?.[errorKey] : undefined}
              >
                {(f.options || "").split(/\r?\n|,/).map((opt, i) => (
                  <s-choice
                    key={i}
                    value={opt.trim()}
                    defaultSelected={opt.trim() === field.defaultValue}
                  >
                    {opt.trim()}
                  </s-choice>
                ))}
              </s-choice-list>
            );
          }

          case "terms": {
            const f = field as TermsField;
            const errorKey = FIELD_KEY_MAP[
              f.name
            ] as unknown as DynamicFieldErrors;
            return (
              <s-checkbox
                key={index}
                name={f.name}
                label={f.label}
                defaultChecked={f?.defaultSelected}
                error={errorKey ? errors?.[errorKey] : undefined}
                onInput={(e: CallbackEvent<"s-checkbox">) =>
                  onChange(f.name, e.currentTarget.checked)
                }
              />
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}

export function DynamicField({
  field,
  onChange,
  errors,
}: {
  field: DynamicFieldConfig;
  onChange: (key: keyof DynamicFieldConfig, value: any) => void;
  errors?: DynamicFieldFieldErrors;
}) {
  switch (field.type) {
    case "text":
      return (
        <FieldRenderer
          fields={TEXT_FIELDS(
            field.label,
            field.showLabel,
            field.placeholder,
            field.required,
          )}
          onChange={(name, value) => {
            const key = FIELD_KEY_MAP[name];
            if (key) onChange(key, value);
          }}
          errors={errors}
        />
      );

    case "textarea":
      return (
        <FieldRenderer
          fields={TEXTAREA_FIELDS(
            field.label,
            field.showLabel,
            field.placeholder,
            field.required,
          )}
          onChange={(name, value) => {
            const key = FIELD_KEY_MAP[name];
            if (key) onChange(key, value);
          }}
          errors={errors}
        />
      );

    case "select":
      return (
        <FieldRenderer
          fields={SELECT_FIELDS(
            field.label,
            field.showLabel,
            field.placeholder,
            field.options,
            field.defaultValue,
            field.required,
          )}
          onChange={(name, value) => {
            const key = FIELD_KEY_MAP[name];
            if (key) onChange(key, value);
          }}
          errors={errors}
        />
      );

    case "checkbox":
      return (
        <FieldRenderer
          fields={CHECKBOX_FIELDS(
            field.label,
            field.showLabel,
            field.options,
            field.defaultValue,
            field.required,
          )}
          onChange={(name, value) => {
            const key = FIELD_KEY_MAP[name];
            if (key) onChange(key, value);
          }}
          errors={errors}
        />
      );

    case "radio":
      return (
        <FieldRenderer
          fields={RADIO_FIELDS(
            field.label,
            field.showLabel,
            field.options,
            field.defaultValue,
            field.required,
          )}
          onChange={(name, value) => {
            const key = FIELD_KEY_MAP[name];
            if (key) onChange(key, value);
          }}
          errors={errors}
        />
      );

    case "terms":
      return (
        <FieldRenderer
          fields={TERMS_FIELDS(
            field.label,
            field.value,
            field.defaultSelected,
            field.required,
          )}
          onChange={(name, value) => {
            const key = FIELD_KEY_MAP[name];
            if (key) onChange(key, value);
          }}
          errors={errors}
        />
      );
    default:
      return <div>No Content</div>;
  }
}

interface FieldTypeOption {
  type: string;
  label: string;
  icon:
    | "text"
    | "text-block"
    | "select"
    | "checkbox"
    | "button"
    | "paper-check";
}

const fieldsData = [
  {
    id: "fld_1",
    type: "text",
    label: "Email",
    showLabel: true,
    placeholder: "Enter your email",
    required: true,
  },
  {
    id: "fld_2",
    type: "textarea",
    label: "Message",
    showLabel: true,
    placeholder: "Enter your message",
    required: false,
  },
  {
    id: "fld_3",
    type: "select",
    label: "Category",
    showLabel: true,
    placeholder: "Choose category",
    options: "General,Support,Sales",
    defaultValue: "General",
    required: true,
  },
  {
    id: "fld_4",
    type: "radio",
    label: "Priority",
    showLabel: true,
    options: "Low,Medium,High",
    defaultValue: "Medium",
    required: true,
  },
  {
    id: "fld_5",
    type: "terms",
    showLabel: false,
    label: "Accept Terms & Conditions",
    value: "accepted",
    defaultSelected: false,
    required: true,
  },
];

interface FieldCardProps {
  fields: DynamicFieldConfig[];
  onChange: (fields: DynamicFieldConfig[]) => void;
  errors: DynamicFieldErrors;
}

export default function FieldCard({
  fields,
  onChange,
  errors,
}: FieldCardProps) {
  const modalRef = useRef<any>(null);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fieldTypeOptions: FieldTypeOption[] = [
    { type: "text", label: "Text", icon: "text" },
    { type: "textarea", label: "Textarea", icon: "text-block" },
    { type: "select", label: "Select", icon: "select" },
    { type: "checkbox", label: "Checkbox", icon: "checkbox" },
    { type: "radio", label: "Radio", icon: "button" },
    { type: "terms", label: "Terms", icon: "paper-check" },
  ];

  const handleAddField = (fieldType: FieldTypeOption) => {
    const id = `fld_${Date.now()}`;

    let newField: DynamicFieldConfig | null = null;

    switch (fieldType.type) {
      case "text":
      case "textarea":
        newField = {
          id,
          type: fieldType.type,
          label: fieldType.label,
          showLabel: true,
          required: false,
          placeholder: "",
        };
        break;

      case "select":
        newField = {
          id,
          type: "select",
          label: fieldType.label,
          showLabel: true,
          required: false,
          placeholder: "Select an option",
          options: "Option 1\nOption 2",
          defaultValue: "",
        };
        break;

      case "checkbox":
      case "radio":
        newField = {
          id,
          type: fieldType.type,
          label: fieldType.label,
          showLabel: true,
          required: false,
          options: "Option 1\nOption 2",
          defaultValue: "",
        };
        break;

      case "terms":
        newField = {
          id,
          type: "terms",
          label: fieldType.label,
          showLabel: false,
          required: true,
          value: "I agree to the terms and conditions",
          defaultSelected: false,
        };
        break;
    }

    onChange([...fields, newField!]);
    console.log("ref", modalRef?.current?.hideOverlay());
    modalRef.current?.hideOverlay();
  };

  const handleDeleteField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const updateField = <T extends DynamicFieldConfig>(
    fieldId: string,
    updater: (field: T) => T,
  ) => {
    onChange(fields.map((f) => (f.id === fieldId ? updater(f as T) : f)));
  };

  const toggleExpand = (id: string) => {
    if (isDragging) return;

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <>
      <s-section>
        <DndContext
          sensors={sensors}
          // measuring={{
          //   droppable: {
          //     strategy: MeasuringStrategy.BeforeDragging,
          //   },
          // }}
          collisionDetection={closestCenter}
          onDragStart={(e) => {
            setIsDragging(true);
            setActiveId(e.active.id as string);
          }}
          onDragEnd={({ active, over }) => {
            setIsDragging(false);
            setActiveId(null);

            if (over && active.id !== over.id) {
              const oldIndex = fields.findIndex((f) => f.id === active.id);
              const newIndex = fields.findIndex((f) => f.id === over.id);
              onChange(arrayMove(fields, oldIndex, newIndex));
            }
          }}
          onDragCancel={() => {
            setIsDragging(false);
            setActiveId(null);
          }}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <s-stack gap="base" paddingBlock="base">
              {fields.map((field, index) => (
                <SortableField key={field.id} field={field}>
                  {({ attributes, listeners }) => (
                    <s-box
                      padding="base"
                      borderWidth="base"
                      borderRadius="base"
                    >
                      <Expandable
                        isExpanded={expandedIds.has(field.id)}
                        onOpen={() => toggleExpand(field.id)}
                        Details={
                          <EditCardTemplate
                            field={field}
                            index={index}
                            onOpen={toggleExpand}
                            handleDeleteField={handleDeleteField}
                            dragHandleProps={{
                              ...attributes,
                              ...listeners,
                            }}
                          />
                        }
                        Contents={
                          <s-stack gap="small-300" padding="base">
                            <DynamicField
                              field={field}
                              onChange={(key, value) =>
                                updateField(field.id, (f) => ({
                                  ...f,
                                  [key]: value,
                                }))
                              }
                              errors={errors[field?.id]}
                            />
                          </s-stack>
                        }
                        label=""
                      />
                    </s-box>
                  )}
                </SortableField>
              ))}
            </s-stack>
          </SortableContext>
        </DndContext>

        <s-stack direction="inline" justifyContent="end">
          <s-button icon="plus" onClick={() => modalRef.current?.showOverlay()}>
            Add field
          </s-button>
        </s-stack>
      </s-section>

      <s-modal ref={modalRef} heading="Add field" id="add-field-modal">
        <s-stack gap="base">
          {fieldTypeOptions.map((option) => (
            <s-clickable
              key={`${option.type}_${option.label}`}
              onClick={() => handleAddField(option)}
            >
              <s-box padding="base" borderRadius="base" border="base">
                <s-stack direction="inline" gap="base">
                  <s-icon type={option.icon} />
                  <s-text tone="neutral">{option.label}</s-text>
                </s-stack>
              </s-box>
            </s-clickable>
          ))}
        </s-stack>
      </s-modal>
    </>
  );
}

interface EditCardTemplateProps {
  field: DynamicFieldConfig;
  index: number | string;
  handleDeleteField: (name: string) => void;
  onOpen: (id: string) => void;
  dragHandleProps: any;
}

export function EditCardTemplate({
  field,
  index,
  handleDeleteField,
  onOpen,
  dragHandleProps,
}: EditCardTemplateProps) {
  const getFieldType = (field: DynamicFieldConfig) => {
    switch (true) {
      case field.label === "email":
        return "email";
      case field.label === "phone":
        return "phone";
      case field.type === "text":
        return "text";
      case field.type === "textarea":
        return "text-block";
      case field.type === "select":
        return "select";
      case field.type === "checkbox":
        return "checkbox";
      case field.type === "radio":
        return "button";
      default:
        return "paper-check";
    }
  };

  return (
    <s-stack
      id={`field-item-content-${index}`}
      direction="inline"
      gap="base"
      justifyContent="space-between"
      alignItems="center"
    >
      <s-stack direction="inline" gap="base" alignItems="center">
        <s-icon id={`field-icon-${index}`} type={getFieldType(field)} />
        <s-text id={`field-label-${index}`}>{field.label}</s-text>
      </s-stack>

      <s-stack
        id={`field-actions-${index}`}
        direction="inline"
        gap="small"
        alignItems="center"
      >
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <s-button
            id={`drag-button-${index}`}
            icon="drag-handle"
            variant="tertiary"
            accessibilityLabel="Drag to reorder"
            {...dragHandleProps}
          />
        </div>

        <s-button
          id={`delete-button-${index}`}
          icon="delete"
          variant="tertiary"
          accessibilityLabel="Delete field"
          onClick={() => handleDeleteField(field.id)}
          disabled={field?.id === "fld_phone" || field?.id === "fld_email"}
        />
        <s-button
          id={`collapse-button-${index}`}
          icon="chevron-up"
          variant="tertiary"
          accessibilityLabel="Collapse field"
          onClick={() => onOpen(field.id)}
        />
      </s-stack>
    </s-stack>
  );
}

// 1. Change SortableField to use children as a function
function SortableField({
  field,
  children,
}: {
  field: DynamicFieldConfig;
  children: (props: {
    attributes: any;
    listeners: any;
    isDragging: boolean;
  }) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        // visibility: isDragging ? "hidden" : "visible",
      }}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

// export default function FieldCard() {
//   const [fields, setFields] = useState<DynamicFieldConfig[]>();

//   const modalRef = useRef<any>(null);

//   const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

//   const [activeId, setActiveId] = useState<string | null>(null);

//   // const fieldTypeOptions: Partial<
//   //   DynamicFieldConfig & {
//   // icon:
//   //   | "text"
//   //   | "text-block"
//   //   | "select"
//   //   | "checkbox"
//   //   | "button"
//   //   | "paper-check";
//   //   }
//   // >[] = [
//   const fieldTypeOptions: FieldTypeOption[] = [
//     { type: "text", label: "Text", icon: "text" },
//     { type: "textarea", label: "Textarea", icon: "text-block" },
//     { type: "select", label: "Select", icon: "select" },
//     { type: "checkbox", label: "Checkbox", icon: "checkbox" },
//     { type: "radio", label: "Radio", icon: "button" },
//     { type: "terms", label: "Terms", icon: "paper-check" },
//   ];

//   // const handleAddField = (fieldType: FieldTypeOption): void => {
//   //   const name: string = `${fieldType.type}_${Date.now()}`;
//   //   let newField: DynamicFieldConfig;

//   //   switch (fieldType.type) {
//   //     case "text":
//   //       // newField = { type: "text", , label: fieldType.label };
//   //       newField = {
//   //         id: name,
//   //         type: "text",
//   //         label: fieldType.label,
//   //         showLabel: true,
//   //         placeholder: "Enter your email",
//   //         required: true,
//   //       };
//   //       break;

//   //     case "textarea":
//   //       newField = { type: "textarea", name, label: fieldType.label };
//   //       break;

//   //     case "checkbox":
//   //       newField = { type: "checkbox", name, label: fieldType.label };
//   //       break;

//   //     case "select":
//   //       newField = { type: "select", name, label: fieldType.label };
//   //       break;

//   //     case "radio":
//   //       newField = { type: "radio", name, label: fieldType.label };
//   //       break;

//   //     default:
//   //       newField = { type: "terms", name, label: fieldType.label };
//   //       break;
//   //   }

//   //   setFields([...fields, newField]);
//   //   modalRef.current?.hideOverlay();
//   // };

//   useEffect(() => {
//     console.log("fields", fields);
//   }, [fields]);

//   const handleAddField = (fieldType: FieldTypeOption): void => {
//     const id = `fld_${Date.now()}`;

//     let newField: DynamicFieldConfig;

//     switch (fieldType.type) {
//       case "text":
//       case "textarea": {
//         newField = {
//           id,
//           type: fieldType.type,
//           label: fieldType.label,
//           showLabel: true,
//           required: false,
//           placeholder: "",
//         };
//         break;
//       }

//       case "select": {
//         newField = {
//           id,
//           type: "select",
//           label: fieldType.label,
//           showLabel: true,
//           required: false,
//           placeholder: "Select an option",
//           options: "Option 1\nOption 2",
//           defaultValue: "",
//         };
//         break;
//       }

//       case "checkbox":
//       case "radio": {
//         newField = {
//           id,
//           type: fieldType.type,
//           label: fieldType.label,
//           showLabel: true,
//           required: false,
//           options: "Option 1\nOption 2",
//           defaultValue: "",
//         };
//         break;
//       }

//       case "terms": {
//         newField = {
//           id,
//           type: "terms",
//           label: fieldType.label,
//           showLabel: false,
//           required: true,
//           value: "I agree to the terms and conditions",
//           defaultSelected: false,
//         };
//         break;
//       }

//       default: {
//         // Exhaustive safety (never reached)
//         throw new Error(`Unsupported field type: ${fieldType.type}`);
//       }
//     }

//     setFields((prev) => [...prev, newField]);
//     modalRef.current?.hideOverlay();
//   };

//   const handleDeleteField = (fieldName: string): void => {
//     setFields(fields.filter((field) => field.id !== fieldName));
//   };

//   const handleOpenModal = (): void => {
//     modalRef.current?.showOverlay();
//   };

//   const toggleExpand = (id: string) => {
//     if (isDragging) return; // 🔴 THIS IS THE KEY

//     setExpandedIds((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const updateField = (
//     fieldId: string,
//     key: keyof DynamicFieldConfig,
//     value: any,
//   ) => {
//     console.log(fieldId, key, value);
//     setFields((prev) =>
//       prev.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f)),
//     );
//   };

//   // DnD Kit setup
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//   );

//   const [isDragging, setIsDragging] = useState(false);

//   return (
//     <>
//       <s-section id="fields-setting-section" heading="Fields setting">
//         <s-link id="change-fields-link" href="javascript:void(0)">
//           Change the fields content here
//         </s-link>

//         <DndContext
//           sensors={sensors}
//           measuring={{
//             droppable: {
//               strategy: MeasuringStrategy.BeforeDragging,
//             },
//           }}
//           collisionDetection={closestCenter}
//           onDragStart={(event) => {
//             setIsDragging(true);
//             setActiveId(event.active.id as string);
//           }}
//           onDragEnd={(event) => {
//             setIsDragging(false);
//             setActiveId(null);
//             const { active, over } = event;
//             if (over && active.id !== over.id) {
//               const oldIndex = fields.findIndex((f) => f.id === active.id);
//               const newIndex = fields.findIndex((f) => f.id === over.id);
//               setFields(arrayMove(fields, oldIndex, newIndex));
//             }
//           }}
//           onDragCancel={() => {
//             setIsDragging(false);
//             setActiveId(null);
//           }}
//         >
//           <SortableContext
//             items={fields.map((f) => f.id)}
//             strategy={verticalListSortingStrategy}
//           >
//             <s-stack gap="base">
//               {fields.map((field, index) => (
//                 <SortableField key={field.id} field={field}>
//                   {({ attributes, listeners }) => (
//                     <Fragment key={field.id}>
//                       <s-box
//                         padding="base"
//                         borderWidth="base"
//                         borderRadius="base"
//                       >
//                         <Expandable
//                           Details={
//                             <EditCardTemplate
//                               field={field}
//                               index={index}
//                               handleDeleteField={handleDeleteField}
//                               onOpen={toggleExpand}
//                               dragHandleProps={{ ...attributes, ...listeners }}
//                             />
//                           }
//                           Contents={
//                             <DynamicField
//                               field={field}
//                               onChange={(key, value) =>
//                                 updateField(field.id, key, value)
//                               }
//                             />
//                           }
//                           isExpanded={expandedIds.has(field.id)}
//                           label=""
//                         />
//                       </s-box>
//                     </Fragment>
//                   )}
//                 </SortableField>
//               ))}
//             </s-stack>
//           </SortableContext>
//         </DndContext>

//         <s-stack
//           id="add-button-container"
//           direction="inline"
//           justifyContent="end"
//         >
//           <s-button id="add-field-button" icon="plus" onClick={handleOpenModal}>
//             Add field
//           </s-button>
//         </s-stack>
//       </s-section>

//       <s-modal
//         ref={modalRef}
//         id="add-field-modal"
//         heading="Add field to form back in stock"
//       >
//         <s-stack id="modal-field-types-stack" gap="base" direction="block">
//           {fieldTypeOptions.map((option) => (
//             <s-clickable
//               id={`field-type-option-${option.type}`}
//               key={option.type}
//               onClick={() => handleAddField(option)}
//             >
//               <s-box padding="base" borderRadius="base">
//                 <s-stack
//                   id={`field-type-content-${option.type}`}
//                   direction="inline"
//                   gap="base"
//                   alignItems="center"
//                 >
//                   <s-icon
//                     id={`field-type-icon-${option.type}`}
//                     type={option.icon as (typeof option)["icon"]}
//                   />
//                   <s-text id={`field-type-label-${option.type}`}>
//                     {option.label}
//                   </s-text>
//                 </s-stack>
//               </s-box>
//             </s-clickable>
//           ))}
//         </s-stack>

//         <s-button
//           slot="secondary-actions"
//           id="modal-cancel-button"
//           variant="secondary"
//           commandFor="add-field-modal"
//           command="--hide"
//         >
//           Cancel
//         </s-button>
//       </s-modal>
//     </>
//   );
// }

import { FieldError } from "app/hooks/useAppearanceValidation";

export type ButtonStyleValues = {
  normalTextColor: string;
  normalBgColor: string;
  hoverTextColor: string;
  hoverBgColor: string;
  fontSize: number;
  padding: number;
  borderCorner: number;
};

interface ButtonStyleEditorProps {
  name: string;
  label: string;
  value: ButtonStyleValues;
  onChange: (field: keyof ButtonStyleValues, value: string | number) => void;
  error: Partial<Record<keyof ButtonStyleValues, FieldError>>;
}

export function ButtonStyleEditor({
  name,
  label,
  value,
  onChange,
  error,
}: ButtonStyleEditorProps) {
  // const [styles, setStyles] = useState<ButtonStyleValues>(value);

  // useEffect(() => {
  //   onChange(name, styles);
  // }, [styles]);

  const update = (
    field: keyof ButtonStyleValues,
    newValue: string | number,
  ) => {
    // setStyles((prev) => ({ ...prev, [field]: newValue }));
    onChange(field, newValue);
  };

  return (
    <s-stack gap="base">
      <s-text>{label}</s-text>

      {/* Normal style */}
      <s-stack gap="small">
        <s-text type="strong">Normal style</s-text>
        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          <s-color-field
            id={`${name}-normal-text-color`}
            label="Text color"
            value={value.normalTextColor}
            // onInput={(e) =>
            //   update(
            //     "normalTextColor",
            //     (e.currentTarget as unknown as HTMLInputElement).value,
            //   )
            // }
            onChange={(e) =>
              update(
                "normalTextColor",
                (e.currentTarget as unknown as HTMLInputElement).value,
              )
            }
            error={error?.normalTextColor}
          />
          <s-color-field
            id={`${name}-normal-bg-color`}
            label="Background color"
            value={value.normalBgColor}
            onChange={(e) =>
              update(
                "normalBgColor",
                (e.currentTarget as unknown as HTMLInputElement).value,
              )
            }
            error={error?.normalBgColor}
          />
        </s-grid>
      </s-stack>

      {/* Hover style */}
      <s-stack gap="small">
        <s-text type="strong">Hover style</s-text>
        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          <s-color-field
            id={`${name}-hover-text-color`}
            label="Text color"
            value={value.hoverTextColor}
            onChange={(e) =>
              update(
                "hoverTextColor",
                (e.currentTarget as unknown as HTMLInputElement).value,
              )
            }
            error={error?.hoverTextColor}
          />
          <s-color-field
            id={`${name}-hover-bg-color`}
            label="Background color"
            value={value.hoverBgColor}
            onChange={(e) =>
              update(
                "hoverBgColor",
                (e.currentTarget as unknown as HTMLInputElement).value,
              )
            }
            error={error?.hoverBgColor}
          />
        </s-grid>
      </s-stack>

      {/* Font size */}
      <s-stack gap="small">
        <s-stack direction="inline" justifyContent="space-between">
          <s-text type="strong">Font size</s-text>
          <s-text>{value.fontSize}px</s-text>
        </s-stack>
        <s-number-field
          value={value.fontSize.toString()}
          min={14}
          max={24}
          step={1}
          suffix="px"
          label="Font size"
          labelAccessibilityVisibility="exclusive"
          onInput={(e) =>
            update(
              "fontSize",
              Number((e.currentTarget as unknown as HTMLInputElement).value),
            )
          }
          error={error?.fontSize}
        />
      </s-stack>

      {/* Padding */}
      <s-stack gap="small">
        <s-stack direction="inline" justifyContent="space-between">
          <s-text type="strong">Padding</s-text>
          <s-text>{value.padding}px</s-text>
        </s-stack>
        <s-number-field
          value={value.padding.toString()}
          min={0}
          max={30}
          step={1}
          suffix="px"
          label="Padding"
          labelAccessibilityVisibility="exclusive"
          onInput={(e) =>
            update(
              "padding",
              Number((e.currentTarget as unknown as HTMLInputElement).value),
            )
          }
          error={error?.padding}
        />
      </s-stack>

      {/* Border radius */}
      <s-stack gap="small">
        <s-stack direction="inline" justifyContent="space-between">
          <s-text type="strong">Border corner</s-text>
          <s-text>{value.borderCorner}px</s-text>
        </s-stack>
        <s-number-field
          value={value.borderCorner.toString()}
          min={0}
          max={20}
          step={1}
          suffix="px"
          label="Border corner"
          labelAccessibilityVisibility="exclusive"
          onInput={(e) =>
            update(
              "borderCorner",
              Number((e.currentTarget as unknown as HTMLInputElement).value),
            )
          }
          error={error?.borderCorner}
        />
      </s-stack>
    </s-stack>
  );
}

import { ChartComponentDataType } from "app/types/chart_component";
import { useEffect } from "react";

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface DropdownComponentProps {
  options: DropdownOption[];
  selectedValue: string | number;
  onSelect: (value: string | number, label: string) => void;
  changeValueOnSelect: <T>(value: T) => void;
  menuId: string;
  buttonId: string;
  storeId?: string;
}

async function fetchDataFromAPI(
  value: string,
  storeId?: string,
  changeValueOnSelect?: <T>(value: T) => void,
) {
  try {
    const response = await fetch(
      `http://localhost:3000/store/analytics/performance?store_id=${storeId}&days=${value}`,
    );
    const result = (await response.json()) as ChartComponentDataType;
    if (changeValueOnSelect) changeValueOnSelect<typeof result>(result);
  } catch (error) {
    console.error("API Error:", error);
  }
}

// Reusable dropdown button component with popover
export default function RenderDropdownComponent({
  options,
  selectedValue,
  onSelect,
  changeValueOnSelect,
  menuId,
  buttonId,
  storeId,
}: DropdownComponentProps) {
  const selectedOption: DropdownOption | undefined = options.find(
    (opt) => opt.value === selectedValue,
  );
  const buttonLabel: string = selectedOption
    ? selectedOption.label
    : options[0]?.label || "Select";

  useEffect(() => {
    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (selectedOption && storeId) {
        fetchDataFromAPI(
          selectedOption.value.toString(),
          storeId,
          changeValueOnSelect,
        );
      }
    }, 500); // Wait 500ms after last change

    return () => clearTimeout(timeoutId); // Cleanup
  }, [changeValueOnSelect, selectedOption, storeId]);

  return (
    <>
      <s-button id={buttonId} icon="calendar" commandFor={menuId}>
        <s-stack
          id={`${buttonId}-stack`}
          direction="inline"
          gap="small"
          alignItems="center"
        >
          <s-text id={`${buttonId}-text`}>{buttonLabel}</s-text>
          <s-icon id={`${buttonId}-icon`} type="caret-down" />
        </s-stack>
      </s-button>
      <s-popover id={menuId}>
        <s-stack
          id={`${menuId}-stack`}
          padding="base"
          gap="small-400"
          direction="block"
        >
          {options.map((option, index) => {
            const isSelected: boolean = option.value === selectedValue;
            return (
              <s-button
                key={`${menuId}-option-${index}`}
                id={`${menuId}-option-${index}`}
                onClick={() => onSelect(option.value, option.label)}
                variant={isSelected ? "secondary" : "tertiary"}
                // background={isSelected ? "subdued" : "transparent"}

                // padding="small-200"
                // borderRadius="base"
                command="--hide"
                commandFor={menuId}
              >
                <s-stack
                  id={`${menuId}-option-stack-${index}`}
                  direction="inline"
                  gap="small"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <s-text id={`${menuId}-option-text-${index}`}>
                    {option.label}
                  </s-text>
                  {/* {isSelected && (
                    <s-icon id={`${menuId}-check-${index}`} type="check" />
                  )} */}
                </s-stack>
              </s-button>
            );
          })}
        </s-stack>
      </s-popover>
    </>
  );
}

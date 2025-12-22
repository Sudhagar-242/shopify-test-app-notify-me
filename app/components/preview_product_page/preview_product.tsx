/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AppearanceForm } from "app/routes/app.requests._index";
import { ButtonStyleValues } from "../form_components/button_style_editor";
import { useRef, useState } from "react";
import { DynamicFieldConfig } from "../form_builder/edit_card";
import parse from "html-react-parser";
import { COUNTRIES } from "app/constants/constants";

// ProductPreview component - reusable preview panel
interface ProductPreviewProps {
  price?: string;
  buttonText?: string;
  buttonTone?: "neutral" | "critical" | "auto";
  instructionText?: string;
  formData: AppearanceForm;
}

function buildButtonStyle(style: ButtonStyleValues): React.CSSProperties {
  return {
    color: style.normalTextColor,
    backgroundColor: style.normalBgColor,
    fontSize: `${style.fontSize}px`,
    padding: `${style.padding}px`,
    borderRadius: `${style.borderCorner}px`,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    transition: "all 0.2s ease",
  };
}
function PreviewField({ field }: { field: DynamicFieldConfig }) {
  switch (field.type) {
    case "text":
      return (
        <s-text-field
          label={field.showLabel ? field.label : undefined}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case "textarea":
      return (
        <s-text-area
          label={field.showLabel ? field.label : undefined}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case "select":
      return (
        <s-select
          label={field.showLabel ? field.label : undefined}
          required={field.required}
        >
          {(field.options || "").split(/\r?\n|,/).map((opt, i) => (
            <s-option key={i} value={opt.trim()}>
              {opt.trim()}
            </s-option>
          ))}
        </s-select>
      );

    case "checkbox":
      return (
        <s-choice-list label={field.showLabel ? field.label : undefined}>
          {(field.options || "").split(/\r?\n|,/).map((opt, i) => (
            <s-choice key={i} value={opt.trim()}>
              {opt.trim()}
            </s-choice>
          ))}
        </s-choice-list>
      );

    case "radio":
      return (
        <s-choice-list label={field.showLabel ? field.label : undefined}>
          {(field.options || "").split(/\r?\n|,/).map((opt, i) => (
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

    case "terms":
      return (
        <s-checkbox checked={field.defaultSelected} required={field.required}>
          {field.value}
        </s-checkbox>
      );

    default:
      return null;
  }
}

interface HtmlPreviewFieldProps {
  field: DynamicFieldConfig & { placeholder?: string };
}

function HtmlPreviewField({ field }: HtmlPreviewFieldProps) {
  if (field?.id === "fld_phone") {
    return (
      <PhoneField
        id={field.id} // "fld_phone"
        placeholder={field?.placeholder || ""}
        label={field.showLabel ? field.label : undefined}
        required={field.required}
      />
    );
  }

  switch (field.type) {
    case "text":
    case "textarea": {
      const Input = field.type === "text" ? "input" : "textarea";

      return (
        <div className="preview-field">
          {field.showLabel && (
            <label className="preview-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
          )}

          <Input
            className="preview-input"
            placeholder={field.placeholder}
            required={field.required}
          />
        </div>
      );
    }

    case "select":
      return (
        <div className="preview-field">
          {field.showLabel && (
            <label className="preview-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
          )}

          <select className="preview-input" required={field.required}>
            <option value="" disabled selected>
              {field.placeholder || "Select an option"}
            </option>

            {(field.options || "").split(/\r?\n|,/).map((opt, i) => (
              <option key={i} value={opt.trim()}>
                {opt.trim()}
              </option>
            ))}
          </select>
        </div>
      );

    case "checkbox":
    case "radio":
      return (
        <div className="preview-field">
          {field.showLabel && (
            <div className="preview-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </div>
          )}

          <div className="preview-options">
            {(field.options || "").split(/\r?\n|,/).map((opt, i) => (
              <label key={i} className="preview-option">
                <input
                  type={field.type}
                  name={field.id}
                  value={opt.trim()}
                  required={field.required && field.type === "radio"}
                />
                <span>{opt.trim()}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "terms":
      return (
        <div className="preview-field preview-terms">
          <label className="preview-option">
            <input
              type="checkbox"
              defaultChecked={field.defaultSelected}
              required={field.required}
            />
            <span>{field.value}</span>
          </label>
        </div>
      );

    default:
      return null;
  }
}

function HtmlPreviewForm({ formData }: { formData: AppearanceForm }) {
  const [isHover, setIsHover] = useState(false);

  return (
    <form
      className="preview-form"
      onSubmit={(e) => e.preventDefault()}
      noValidate
    >
      <h3 className="preview-form-title">
        {formData.heading || "Get notified when available"}
      </h3>

      {formData.subHeading && (
        <p className="preview-form-subtitle">{formData.subHeading}</p>
      )}

      <div className="preview-form-fields">
        {formData.fields.map((field) => (
          <HtmlPreviewField key={field.id} field={field} />
        ))}
      </div>

      <button
        type="submit"
        className="preview-submit-btn"
        style={{
          ...buildButtonStyle(formData.subscribe),
          color: isHover
            ? formData.subscribe.hoverTextColor
            : formData.subscribe.normalTextColor,
          backgroundColor: isHover
            ? formData.subscribe.hoverBgColor
            : formData.subscribe.normalBgColor,
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {"Subscribe"}
      </button>

      <p>{parse(formData?.footer)}</p>
    </form>
  );
}

export default function ProductPreview({
  price = "$50.00 USD",
  buttonText = "Email me when available",
  buttonTone = "neutral",
  instructionText = "Click 'Email me when available' to open form submit",
  formData,
}: ProductPreviewProps) {
  const [isHover, setIsHover] = useState(false);

  const modalRef = useRef<any>(null);

  return (
    <s-section id="preview-section" heading="Preview">
      <s-stack gap="base">
        {/* Product image placeholder */}
        <s-box
          id="product-image-placeholder"
          background="subdued"
          blockSize="150px"
          borderRadius="base"
        />

        {/* Product price */}
        <s-text id="product-price" type="strong">
          {price}
        </s-text>

        {/* Product description placeholder lines */}
        <s-stack gap="small">
          <s-box background="subdued" blockSize="12px" borderRadius="small" />
          <s-box background="subdued" blockSize="12px" borderRadius="small" />
          <s-box background="subdued" blockSize="12px" borderRadius="small" />
        </s-stack>

        {/* Email notification button */}

        <div
          id="zuper-notify-button"
          style={{
            ...buildButtonStyle(formData?.notify_me),
            color: isHover
              ? formData?.notify_me?.hoverTextColor
              : formData?.notify_me?.normalTextColor,
            backgroundColor: isHover
              ? formData?.notify_me?.hoverBgColor
              : formData?.notify_me?.normalBgColor,
            display:
              formData?.product_detail_show === "hidden"
                ? "none"
                : "inline-flex",
          }}
          role="button"
          aria-haspopup="dialog"
          aria-controls="notifyModal"
          tabIndex={0}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={() => modalRef?.current?.showOverlay()}
        >
          <span>Notify Me!</span>
        </div>

        <s-modal ref={modalRef} padding="base" id="preview-form">
          <s-stack gap="base">
            <HtmlPreviewForm formData={formData} />

            <button
              type="button"
              className="close-btn"
              onClick={() => modalRef.current?.hideOverlay()}
            >
              Close
            </button>
          </s-stack>
        </s-modal>

        {/* Instruction text */}
        <s-text id="instruction-text" color="subdued">
          {instructionText}
        </s-text>
      </s-stack>
    </s-section>
  );
}

interface PhoneFieldProps {
  id: string; // should be "fld_phone"
  placeholder: string;
  label?: string;
  required?: boolean;
}

export function PhoneField({
  id,
  label = "Phone Number",
  required = false,
  placeholder,
}: PhoneFieldProps) {
  return (
    <div className="preview-field">
      {label && (
        <label className="preview-label" htmlFor={`${id}_number`}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="preview-phone-wrapper">
        <select
          className="preview-phone-country"
          id={`${id}_country`}
          name="country"
          required={required}
          defaultValue="IN"
        >
          {COUNTRIES.map((c) => (
            <option
              key={c.country}
              value={JSON.stringify({
                country: c.country,
                code: c.code,
              })}
            >
              {c.country} (+{c.code})
            </option>
          ))}
        </select>

        <input
          type="tel"
          id={`${id}_number`}
          name="phone_number"
          className="preview-phone-input"
          placeholder={placeholder}
          required={required}
        />
      </div>
    </div>
  );
}

/* eslint-disable react-refresh/only-export-components */
import React from "react";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationRule {
  type?: "text" | "number" | "email" | "url" | "textarea" | "popup" | "password" | "select" | "dropLocations" | "image" | "date";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  label?: string;
}

export const KiduValidation = {
  validate(value: unknown, rules: ValidationRule): ValidationResult {

    // ⭐ Automatically append red "*" to required labels
    const rawLabel = rules.label || "This field";
    const label = rules.required ? `${rawLabel} ` : rawLabel;

    const val = value;

    if (rules.type === "dropLocations") {
      const arr = Array.isArray(val) ? val : [];
      if (rules.required && arr.filter(v => v.trim() !== "").length === 0)
        return { isValid: false, message: `${label} is required.` };
      if (rules.minLength && arr.length < rules.minLength)
        return { isValid: false, message: `${label} must have at least ${rules.minLength} locations.` };
      if (rules.maxLength && arr.length > rules.maxLength)
        return { isValid: false, message: `${label} can have at most ${rules.maxLength} locations.` };
      return { isValid: true };
    }

    if (rules.type === "image") {
      const file = val as File | null;
      if (rules.required && !file)
        return { isValid: false, message: `${label} is required.` };

      if (file) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type))
          return { isValid: false, message: `${label} must be a valid image (JPG, PNG, WEBP).` };

        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024)
          return { isValid: false, message: `${label} must be less than ${maxSizeMB}MB.` };
      }
      return { isValid: true };
    }

    if (rules.type === "select") {
      if (rules.required && (!val || String(val).trim() === ""))
        return { isValid: false, message: `${label} is required.` };
    }

    if (rules.type === "date") {
      const str = String(val ?? "").trim();
      if (rules.required && !str)
        return { isValid: false, message: `${label} is required.` };

      if (str) {
        const d = new Date(str);
        if (isNaN(d.getTime()))
          return { isValid: false, message: `${label} must be a valid date.` };
      }
      return { isValid: true };
    }

    const strVal = String(val ?? "").trim();

    if (rules.required && !strVal)
      return { isValid: false, message: `${label} is required.` };

    if (rules.type === "number" && strVal && isNaN(Number(strVal)))
      return { isValid: false, message: `${label} must be a number.` };

    if (rules.type === "email" && strVal && !/^[^\s@]+@gmail\.com$/.test(strVal))
      return { isValid: false, message: "Please enter a valid Gmail address." };

    if (rules.type === "url" && strVal && !/^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/.test(strVal))
      return { isValid: false, message: "Please enter a valid website URL." };

    if (rules.type === "password" && strVal) {
      if (strVal.length < 8)
        return { isValid: false, message: `${label} must be at least 8 characters.` };
      if (!/[A-Z]/.test(strVal))
        return { isValid: false, message: `${label} must contain at least one uppercase letter.` };
      if (!/[a-z]/.test(strVal))
        return { isValid: false, message: `${label} must contain at least one lowercase letter.` };
      if (!/[0-9]/.test(strVal))
        return { isValid: false, message: `${label} must contain at least one number.` };
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(strVal))
        return { isValid: false, message: `${label} must contain at least one special character.` };
    }

    if (rules.minLength && strVal.length < rules.minLength)
      return { isValid: false, message: `${label} must be at least ${rules.minLength} characters.` };

    if (rules.maxLength && strVal.length > rules.maxLength)
      return { isValid: false, message: `${label} must be less than ${rules.maxLength} characters.` };

    if (rules.pattern && strVal && !rules.pattern.test(strVal))
      return { isValid: false, message: `Invalid ${label.toLowerCase()}.` };

    return { isValid: true };
  }
};

export const ValidationMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div style={{ fontSize: "0.8rem", color: "#EF4444", marginTop: "4px", fontFamily: "Urbanist" }}>
      {message}
    </div>
  );
};

export default KiduValidation;

"use client";

import { Eye, EyeOff, LucideIcon } from "lucide-react";
import React from "react";

interface FieldProps {
  field: {
    id: number;
    name: string;
    type: string;
    icon: LucideIcon | null;
  };
  values?: Record<string, string>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormField({ field, values, onChange }: FieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const currentValues = values || {};

  if (field.name === "Name") {
    return (
      <div className="flex flex-col mb-4">
        <label
          htmlFor="firstname"
          className="mb-1.5 text-sm font-medium text-gray-300"
        >
          {field.name}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="firstname"
            name="firstname"
            className="form-input w-full border border-gray-800 rounded-md"
            required
            value={currentValues.firstname || ""}
            placeholder="First name"
            onChange={onChange}
          />
          <input
            type="text"
            id="middlename"
            name="middlename"
            className="form-input w-full border border-gray-800 rounded-md"
            required
            value={currentValues.middlename || ""}
            placeholder="Middle name"
            onChange={onChange}
          />
          <input
            type="text"
            id="lastname"
            name="lastname"
            className="form-input w-full border border-gray-800 rounded-md"
            required
            value={currentValues.lastname || ""}
            placeholder="Last name"
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  const fieldId = field.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

  if (field.name === "Password" || field.name === "Confirm Password") {
    return (
      <div className="flex flex-col mb-4">
        <label
          htmlFor={fieldId}
          className="mb-1.5 text-sm font-medium text-gray-300"
        >
          {field.name}
        </label>
        <div className="flex items-center border border-gray-800 rounded-md mb-3">
          {field.icon && <field.icon className=" text-gray-400 m-2" />}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              id={fieldId}
              name={fieldId}
              className={`form-input w-full ${field.icon ? "pl-10" : "px-3"}`}
              required
              value={currentValues[fieldId] || ""}
              placeholder={`Enter your ${field.name.toLowerCase()}`}
              onChange={onChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <Eye size={20} className="text-gray-400" />
              ) : (
                <EyeOff size={20} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-4">
      <label
        htmlFor={fieldId}
        className="mb-1.5 text-sm font-medium text-gray-300"
      >
        {field.name}
      </label>
      <div className="flex items-center border border-gray-800 rounded-md mb-3">
        {field.icon && <field.icon className=" text-gray-400 m-2" />}
        <input
          type={field.type}
          id={fieldId}
          name={fieldId}
          value={currentValues[fieldId] || ""}
          className={`form-input w-full ${field.icon ? "pl-10" : "px-3"}`}
          required
          placeholder={`Enter your ${field.name.toLowerCase()}`}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

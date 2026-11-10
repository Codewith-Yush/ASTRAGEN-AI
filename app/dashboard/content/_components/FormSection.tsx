"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

interface FormOption {
  value: string;
  label: string;
}

interface FormItem {
  field: "input" | "textarea" | "select" | "checkbox" | "range";
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[] | FormOption[];
  min?: number;
  max?: number;
  initialValue?: string | number | boolean;
}

interface TEMPLATE {
  icon?: string;
  name: string;
  desc: string;
  form?: FormItem[];
}

interface PROPS {
  selectedTemplate?: TEMPLATE;
  userFormInput: (data: any) => void;
  loading: boolean;
}

function FormSection({ selectedTemplate, userFormInput, loading }: PROPS) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = useCallback(
    (data: { [key: string]: any }) => {
      const newErrors: { [key: string]: string } = {};
      selectedTemplate?.form?.forEach((item) => {
        const value = data[item.name];
        if (
          item.required &&
          (value === undefined ||
            value === null ||
            (typeof value === "string" && !value.trim()))
        ) {
          newErrors[item.name] = `${item.label} is required`;
        }
        if (item.field === "textarea" && value?.length > 2000) {
          newErrors[item.name] = "Maximum 2000 characters allowed";
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [selectedTemplate]
  );

  useEffect(() => {
    if (selectedTemplate?.form) {
      const initialData = selectedTemplate.form.reduce((acc, item) => {
        let initialValue: string | number | boolean = "";

        if (item.field === "checkbox") {
          initialValue = item.initialValue ?? false;
        } else if (item.field === "range") {
          initialValue = item.initialValue ?? item.min ?? 0;
        } else if (item.field === "select") {
          if (item.options && item.options.length > 0) {
            initialValue =
              item.initialValue ??
              (typeof item.options[0] === "string"
                ? item.options[0]
                : (item.options[0] as FormOption).value);
          } else {
            initialValue = "";
          }
        } else {
          initialValue = item.initialValue ?? "";
        }

        return { ...acc, [item.name]: initialValue };
      }, {});
      setFormData(initialData);
      setIsFormValid(validateForm(initialData));
    }
  }, [selectedTemplate, validateForm]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    isCheckbox: boolean = false
  ) => {
    const { name, value, checked } = event.target as any;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: isCheckbox ? checked : value,
      };
      setIsFormValid(validateForm(newData));
      return newData;
    });
  };

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: parseInt(value, 10) };
      setIsFormValid(validateForm(newData));
      return newData;
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm(formData)) {
      userFormInput(formData);
    }
  };

  const getOptionDetails = (option: string | FormOption) => {
    if (typeof option === "string") {
      return { value: option, label: option };
    }
    return option;
  };

  return (
    <div className="bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800/70 pb-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Prompt Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize the input parameters for tailored Gemini AI generation.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {selectedTemplate?.form?.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <label
              htmlFor={item.name}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {item.label}
              {item.required && <span className="text-rose-500 ml-1">*</span>}
            </label>

            {item.field === "input" && (
              <input
                id={item.name}
                type="text"
                name={item.name}
                value={formData[item.name] || ""}
                onChange={handleChange}
                placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
                className={`
                  w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border transition-colors
                  ${
                    errors[item.name]
                      ? "border-rose-400 focus:ring-rose-500/20"
                      : "border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }
                  focus:outline-none
                `}
                required={item.required}
              />
            )}

            {item.field === "textarea" && (
              <div className="space-y-1">
                <textarea
                  id={item.name}
                  name={item.name}
                  rows={4}
                  value={formData[item.name] || ""}
                  onChange={handleChange}
                  placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
                  className={`
                    w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border transition-colors resize-y min-h-[90px]
                    ${
                      errors[item.name]
                        ? "border-rose-400 focus:ring-rose-500/20"
                        : "border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    }
                    focus:outline-none leading-relaxed
                  `}
                  required={item.required}
                />
                <div className="flex justify-end text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{formData[item.name]?.length || 0}/2000</span>
                </div>
              </div>
            )}

            {item.field === "select" && (
              <select
                id={item.name}
                name={item.name}
                value={formData[item.name] || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none cursor-pointer"
                required={item.required}
              >
                <option value="" disabled>
                  Select an option
                </option>
                {item.options?.map((option, i) => {
                  const { value, label } = getOptionDetails(option);
                  return (
                    <option key={i} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            )}

            {item.field === "checkbox" && (
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id={item.name}
                  name={item.name}
                  checked={formData[item.name] || false}
                  onChange={(e) => handleChange(e, true)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor={item.name}
                  className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                >
                  {item.placeholder || "Enable option"}
                </label>
              </div>
            )}

            {item.field === "range" && (
              <div className="space-y-2 pt-1">
                <input
                  type="range"
                  id={item.name}
                  name={item.name}
                  min={item.min || 0}
                  max={item.max || 100}
                  step={1}
                  value={formData[item.name] || item.min || 0}
                  onChange={handleRangeChange}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{item.min || 0}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Value: {formData[item.name]}
                  </span>
                  <span>{item.max || 100}</span>
                </div>
              </div>
            )}

            {errors[item.name] && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>{errors[item.name]}</span>
              </p>
            )}
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`
              w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md
              ${
                loading || !isFormValid
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99]"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormSection;

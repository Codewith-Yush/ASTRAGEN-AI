"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RotateCcw, Sparkles } from "lucide-react";

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
  helperText?: string;
  options?: string[] | FormOption[];
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
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

type FormValues = Record<string, string | number | boolean>;
type FormErrors = Record<string, string>;

const DEFAULT_TEXTAREA_LIMIT = 2000;

const getOptionDetails = (option: string | FormOption): FormOption =>
  typeof option === "string" ? { value: option, label: option } : option;

const getInitialValues = (form: FormItem[] = []): FormValues =>
  form.reduce<FormValues>((acc, item) => {
    switch (item.field) {
      case "checkbox":
        acc[item.name] = Boolean(item.initialValue ?? false);
        break;
      case "range":
        acc[item.name] = Number(item.initialValue ?? item.min ?? 0);
        break;
      case "select": {
        const first = item.options?.[0];
        acc[item.name] =
          item.initialValue ?? (first ? getOptionDetails(first).value : "");
        break;
      }
      default:
        acc[item.name] = item.initialValue ?? "";
    }
    return acc;
  }, {});

// Pure function: errors are derived from values, so no extra state to keep in sync.
const validate = (form: FormItem[] = [], values: FormValues): FormErrors => {
  const errors: FormErrors = {};
  form.forEach((item) => {
    const value = values[item.name];

    if (item.required) {
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim()) ||
        (item.field === "checkbox" && value !== true);
      if (empty) {
        errors[item.name] =
          item.field === "checkbox"
            ? `Please confirm: ${item.label}`
            : item.field === "select"
            ? `Please select ${item.label.toLowerCase()}`
            : `${item.label} is required`;
        return;
      }
    }

    if (item.field === "textarea" || item.field === "input") {
      const limit =
        item.maxLength ??
        (item.field === "textarea" ? DEFAULT_TEXTAREA_LIMIT : undefined);
      if (limit && typeof value === "string" && value.length > limit) {
        errors[item.name] = `Maximum ${limit} characters allowed`;
      }
    }
  });
  return errors;
};

const baseFieldClasses =
  "w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed";

const fieldStateClasses = (hasError: boolean) =>
  hasError
    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
    : "border-slate-200/80 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10";

function FormSection({ selectedTemplate, userFormInput, loading }: PROPS) {
  const form = selectedTemplate?.form;
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<FormValues>(() => getInitialValues(form));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Reset whenever a different template is chosen.
  useEffect(() => {
    setValues(getInitialValues(form));
    setTouched({});
    setSubmitAttempted(false);
  }, [form]);

  const allErrors = useMemo(() => validate(form, values), [form, values]);

  // Only surface an error after the user has interacted with the field (or tried to submit),
  // so the form doesn't open covered in red.
  const visibleErrors = useMemo(() => {
    const result: FormErrors = {};
    Object.keys(allErrors).forEach((name) => {
      if (submitAttempted || touched[name]) result[name] = allErrors[name];
    });
    return result;
  }, [allErrors, touched, submitAttempted]);

  const errorCount = Object.keys(allErrors).length;
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(getInitialValues(form)),
    [values, form]
  );

  const setValue = useCallback((name: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const markTouched = useCallback((name: string) => {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }, []);

  const handleReset = () => {
    setValues(getInitialValues(form));
    setTouched({});
    setSubmitAttempted(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setSubmitAttempted(true);

    if (errorCount > 0) {
      // Move focus to the first invalid field so the user sees what to fix.
      const firstInvalid = form?.find((item) => allErrors[item.name]);
      if (firstInvalid) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${CSS.escape(firstInvalid.name)}"]`)
          ?.focus();
      }
      return;
    }

    // Trim text values before sending.
    const cleaned = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    );
    userFormInput(cleaned);
  };

  // Ctrl/Cmd + Enter submits from inside a textarea.
  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const describedBy = (item: FormItem) => {
    const ids: string[] = [];
    if (item.helperText) ids.push(`${item.name}-help`);
    if (visibleErrors[item.name]) ids.push(`${item.name}-error`);
    return ids.length ? ids.join(" ") : undefined;
  };

  const renderField = (item: FormItem) => {
    const hasError = Boolean(visibleErrors[item.name]);
    const value = values[item.name];
    const common = {
      id: item.name,
      name: item.name,
      "aria-invalid": hasError || undefined,
      "aria-describedby": describedBy(item),
      "aria-required": item.required || undefined,
      onBlur: () => markTouched(item.name),
    } as const;

    switch (item.field) {
      case "input":
        return (
          <input
            {...common}
            type="text"
            value={String(value ?? "")}
            maxLength={item.maxLength}
            onChange={(e) => setValue(item.name, e.target.value)}
            placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
            autoComplete="off"
            className={`${baseFieldClasses} ${fieldStateClasses(hasError)}`}
          />
        );

      case "textarea": {
        const limit = item.maxLength ?? DEFAULT_TEXTAREA_LIMIT;
        const length = String(value ?? "").length;
        const nearLimit = length > limit * 0.9;
        return (
          <div className="space-y-1">
            <textarea
              {...common}
              rows={4}
              value={String(value ?? "")}
              onChange={(e) => setValue(item.name, e.target.value)}
              onKeyDown={onTextareaKeyDown}
              placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
              className={`${baseFieldClasses} ${fieldStateClasses(
                hasError
              )} resize-y min-h-[96px] leading-relaxed`}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span className="hidden sm:inline">Tip: Ctrl/⌘ + Enter to generate</span>
              <span
                className={`ml-auto tabular-nums ${
                  length > limit
                    ? "text-rose-500 font-semibold"
                    : nearLimit
                    ? "text-amber-500 font-medium"
                    : ""
                }`}
                aria-live="polite"
              >
                {length}/{limit}
              </span>
            </div>
          </div>
        );
      }

      case "select":
        return (
          <select
            {...common}
            value={String(value ?? "")}
            onChange={(e) => setValue(item.name, e.target.value)}
            className={`${baseFieldClasses} ${fieldStateClasses(hasError)} cursor-pointer`}
          >
            <option value="" disabled>
              Select an option
            </option>
            {item.options?.map((option) => {
              const { value: v, label } = getOptionDetails(option);
              return (
                <option key={v} value={v}>
                  {label}
                </option>
              );
            })}
          </select>
        );

      case "checkbox":
        return (
          <label
            htmlFor={item.name}
            className="flex items-start gap-2.5 pt-1 cursor-pointer select-none"
          >
            <input
              {...common}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setValue(item.name, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {item.placeholder || "Enable option"}
            </span>
          </label>
        );

      case "range": {
        const min = item.min ?? 0;
        const max = item.max ?? 100;
        const current = Number(value ?? min);
        const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
        return (
          <div className="space-y-2 pt-1">
            <input
              {...common}
              type="range"
              min={min}
              max={max}
              step={item.step ?? 1}
              value={current}
              onChange={(e) => setValue(item.name, Number(e.target.value))}
              aria-valuetext={`${current}`}
              style={{
                background: `linear-gradient(to right, rgb(79 70 229) ${percent}%, rgb(203 213 225 / 0.6) ${percent}%)`,
              }}
              className="w-full h-1.5 rounded-lg cursor-pointer appearance-none accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>{min}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {current}
              </span>
              <span>{max}</span>
            </div>
          </div>
        );
      }
    }
  };

  if (!form || form.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121324] border border-dashed border-slate-300 dark:border-[#1E2038] rounded-xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Select a template to get started.
      </div>
    );
  }

  const submitDisabled = loading;

  return (
    <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-[#1E2038] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-[#1E2038] pb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#000000] dark:text-white">
            {selectedTemplate?.name ? `${selectedTemplate.name} — Parameters` : "Engine Parameters"}
          </h2>
          <p className="text-xs text-[#6B6B8C] dark:text-slate-400 mt-0.5">
            Customize the input parameters for tailored Gemini AI generation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty || loading}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        aria-busy={loading}
        className="space-y-5"
      >
        <fieldset disabled={loading} className="space-y-5 border-0 p-0 m-0 min-w-0">
          {form.map((item) => (
            <div key={item.name} className="space-y-1.5">
              {item.field !== "checkbox" && (
                <label
                  htmlFor={item.name}
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {item.label}
                  {item.required ? (
                    <span className="text-rose-500 ml-1" aria-hidden="true">
                      *
                    </span>
                  ) : (
                    <span className="ml-1.5 font-normal text-slate-400 dark:text-slate-500">
                      (optional)
                    </span>
                  )}
                </label>
              )}

              {renderField(item)}

              {item.helperText && !visibleErrors[item.name] && (
                <p id={`${item.name}-help`} className="text-[11px] text-slate-400 dark:text-slate-500">
                  {item.helperText}
                </p>
              )}

              {visibleErrors[item.name] && (
                <p
                  id={`${item.name}-error`}
                  role="alert"
                  className="flex items-center gap-1 text-[11px] text-rose-500 font-medium"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{visibleErrors[item.name]}</span>
                </p>
              )}
            </div>
          ))}
        </fieldset>

        <div className="pt-2 space-y-2">
          {submitAttempted && errorCount > 0 && (
            <p role="alert" className="text-[11px] text-rose-500 font-medium text-center">
              Please fix {errorCount} {errorCount === 1 ? "field" : "fields"} above to continue.
            </p>
          )}

          <button
            type="submit"
            disabled={submitDisabled}
            className={`
              w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
              focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30
              ${
                submitDisabled
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Generating with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default React.memo(FormSection);
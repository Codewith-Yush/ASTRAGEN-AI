"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Info,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Wand2,
  X,
} from "lucide-react";
import { TEMPLATE_SAMPLES } from "./templateSamples";

export interface FormOption {
  value: string;
  label: string;
}

export interface FormItem {
  field: "input" | "textarea" | "select" | "checkbox" | "range" | "number" | "radio";
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  hint?: string;
  options?: string[] | FormOption[];
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  initialValue?: string | number | boolean | string[];
  default?: string | number | boolean | string[];
  multiple?: boolean;
}

export interface TEMPLATE {
  name: string;
  desc: string;
  icon?: string;
  category?: string;
  slug?: string;
  form?: FormItem[];
}

export interface PROPS {
  selectedTemplate?: TEMPLATE;
  userFormInput: (data: any) => void;
  loading: boolean;
  onStop?: () => void;
}

export type FormValues = Record<string, string | number | boolean | string[]>;
export type FormErrors = Record<string, string>;

const DEFAULT_TEXTAREA_LIMIT = 3000;
const DRAFT_STORAGE_PREFIX = "astragen_draft_";

/** Normalizes string or object option format */
const getOptionDetails = (option: string | FormOption): FormOption =>
  typeof option === "string" ? { value: option, label: option } : option;

/** Derives initial values honoring both `initialValue` and `default` */
const getInitialValues = (form: FormItem[] = []): FormValues =>
  form.reduce<FormValues>((acc, item) => {
    const fallbackDefault = item.initialValue ?? item.default;

    switch (item.field) {
      case "checkbox":
        acc[item.name] = Boolean(fallbackDefault ?? false);
        break;

      case "range":
        acc[item.name] = Number(fallbackDefault ?? item.min ?? 0);
        break;

      case "number":
        acc[item.name] =
          fallbackDefault !== undefined && fallbackDefault !== ""
            ? Number(fallbackDefault)
            : item.min !== undefined
            ? item.min
            : "";
        break;

      case "radio": {
        if (fallbackDefault !== undefined && fallbackDefault !== "") {
          acc[item.name] = String(fallbackDefault);
        } else {
          const first = item.options?.[0];
          acc[item.name] = first ? getOptionDetails(first).value : "";
        }
        break;
      }

      case "select": {
        if (item.multiple) {
          if (Array.isArray(fallbackDefault)) {
            acc[item.name] = fallbackDefault.map(String);
          } else if (typeof fallbackDefault === "string" && fallbackDefault) {
            acc[item.name] = [fallbackDefault];
          } else {
            acc[item.name] = [];
          }
        } else {
          if (fallbackDefault !== undefined && fallbackDefault !== "") {
            acc[item.name] = String(fallbackDefault);
          } else {
            acc[item.name] = "";
          }
        }
        break;
      }

      default:
        acc[item.name] = fallbackDefault !== undefined ? String(fallbackDefault) : "";
    }
    return acc;
  }, {});

/** Pure validation function supporting all field types and constraints */
const validate = (form: FormItem[] = [], values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  form.forEach((item) => {
    const value = values[item.name];

    // 1. Required validation
    if (item.required) {
      if (item.field === "checkbox") {
        if (value !== true) {
          errors[item.name] = `Please check "${item.label}"`;
          return;
        }
      } else if (item.field === "select" && item.multiple) {
        if (!Array.isArray(value) || value.length === 0) {
          errors[item.name] = `Please select at least one ${item.label.toLowerCase()}`;
          return;
        }
      } else if (item.field === "number") {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          isNaN(Number(value))
        ) {
          errors[item.name] = `${item.label} is required`;
          return;
        }
      } else if (item.field === "radio") {
        if (value === undefined || value === null || !String(value).trim()) {
          errors[item.name] = `Please choose an option for ${item.label.toLowerCase()}`;
          return;
        }
      } else {
        // Text input, textarea, single select
        const isEmpty =
          value === undefined ||
          value === null ||
          (typeof value === "string" && !value.trim()) ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          errors[item.name] =
            item.field === "select"
              ? `Please select ${item.label.toLowerCase()}`
              : `${item.label} is required`;
          return;
        }
      }
    }

    // 2. Numeric range checks (number field)
    if (item.field === "number" && value !== undefined && value !== null && value !== "") {
      const num = Number(value);
      if (isNaN(num)) {
        errors[item.name] = "Please enter a valid number";
        return;
      }
      if (item.min !== undefined && num < item.min) {
        errors[item.name] = `Minimum allowed is ${item.min}`;
        return;
      }
      if (item.max !== undefined && num > item.max) {
        errors[item.name] = `Maximum allowed is ${item.max}`;
        return;
      }
    }

    // 3. Range slider checks
    if (item.field === "range" && value !== undefined && value !== null) {
      const num = Number(value);
      if (item.min !== undefined && num < item.min) {
        errors[item.name] = `Minimum value is ${item.min}`;
        return;
      }
      if (item.max !== undefined && num > item.max) {
        errors[item.name] = `Maximum value is ${item.max}`;
        return;
      }
    }

    // 4. Character limits
    if ((item.field === "textarea" || item.field === "input") && typeof value === "string") {
      const limit =
        item.maxLength ??
        (item.field === "textarea" ? DEFAULT_TEXTAREA_LIMIT : undefined);
      if (limit && value.length > limit) {
        errors[item.name] = `Maximum ${limit} characters allowed (${value.length}/${limit})`;
        return;
      }
    }
  });

  return errors;
};

const baseFieldClasses =
  "w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed";

const fieldStateClasses = (hasError: boolean) =>
  hasError
    ? "border-rose-400 dark:border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/15"
    : "border-slate-200/90 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/15";

function FormSection({
  selectedTemplate,
  userFormInput,
  loading,
  onStop,
}: PROPS) {
  const form = selectedTemplate?.form;
  const slug = selectedTemplate?.slug || "";
  const formRef = useRef<HTMLFormElement>(null);
  const sampleToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [values, setValues] = useState<FormValues>(() => getInitialValues(form));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Load draft or initial values whenever the template changes
  useEffect(() => {
    const initial = getInitialValues(form);
    if (typeof window !== "undefined" && slug) {
      try {
        const savedDraft = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${slug}`);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          // Only restore if the draft has some non-empty content
          const hasContent = Object.values(parsed).some(
            (v) =>
              (typeof v === "string" && v.trim().length > 0) ||
              (Array.isArray(v) && v.length > 0) ||
              typeof v === "number" ||
              typeof v === "boolean"
          );
          if (hasContent) {
            setValues({ ...initial, ...parsed });
            setTouched({});
            setSubmitAttempted(false);
            setHasRestoredDraft(true);
            return;
          }
        }
      } catch (e) {
        // Ignore localStorage read errors
      }
    }

    setValues(initial);
    setTouched({});
    setSubmitAttempted(false);
    setHasRestoredDraft(false);
  }, [form, slug]);

  // Debounced auto-save draft to localStorage as user types
  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    const timer = setTimeout(() => {
      try {
        const hasValues = Object.keys(values).length > 0;
        if (hasValues) {
          localStorage.setItem(
            `${DRAFT_STORAGE_PREFIX}${slug}`,
            JSON.stringify(values)
          );
        }
      } catch (e) {
        // Ignore localStorage quota or private mode errors
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [values, slug]);

  // Clean up sample toast timer
  useEffect(() => {
    return () => {
      if (sampleToastTimerRef.current) clearTimeout(sampleToastTimerRef.current);
    };
  }, []);

  const allErrors = useMemo(() => validate(form, values), [form, values]);

  // Errors visible only after touch or submit attempt
  const visibleErrors = useMemo(() => {
    const result: FormErrors = {};
    Object.keys(allErrors).forEach((name) => {
      if (submitAttempted || touched[name]) {
        result[name] = allErrors[name];
      }
    });
    return result;
  }, [allErrors, touched, submitAttempted]);

  const errorCount = Object.keys(allErrors).length;

  const isDirty = useMemo(() => {
    const initial = getInitialValues(form);
    return JSON.stringify(values) !== JSON.stringify(initial);
  }, [values, form]);

  const setValue = useCallback(
    (name: string, value: string | number | boolean | string[]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const markTouched = useCallback((name: string) => {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }, []);

  const clearField = useCallback(
    (name: string, fallback: string | number | boolean | string[] = "") => {
      setValues((prev) => ({ ...prev, [name]: fallback }));
      markTouched(name);
    },
    [markTouched]
  );

  const handleReset = () => {
    const initial = getInitialValues(form);
    setValues(initial);
    setTouched({});
    setSubmitAttempted(false);
    setHasRestoredDraft(false);

    if (typeof window !== "undefined" && slug) {
      try {
        localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${slug}`);
      } catch (e) {}
    }
  };

  const handleFillExample = () => {
    const sample = TEMPLATE_SAMPLES[slug];
    if (sample) {
      setValues((prev) => ({ ...prev, ...sample }));
    } else if (form) {
      // Fallback: fill each field intelligently from placeholders or options
      const generated: FormValues = {};
      form.forEach((item) => {
        if (item.field === "checkbox") {
          generated[item.name] = true;
        } else if (item.field === "range") {
          generated[item.name] = Math.round(
            ((item.min ?? 0) + (item.max ?? 100)) / 2
          );
        } else if (item.field === "number") {
          generated[item.name] = item.default ?? item.min ?? 10;
        } else if (item.field === "select") {
          if (item.multiple) {
            const opts = item.options?.map(getOptionDetails) || [];
            generated[item.name] = opts.slice(0, 2).map((o) => o.value);
          } else {
            const first = item.options?.[0];
            generated[item.name] = first ? getOptionDetails(first).value : "";
          }
        } else if (item.field === "radio") {
          const first = item.options?.[0];
          generated[item.name] = first ? getOptionDetails(first).value : "";
        } else {
          generated[item.name] =
            item.placeholder || `Sample high-quality input for ${item.label}`;
        }
      });
      setValues((prev) => ({ ...prev, ...generated }));
    }

    setTouched({});
    setSubmitAttempted(false);
    setSampleLoaded(true);

    if (sampleToastTimerRef.current) clearTimeout(sampleToastTimerRef.current);
    sampleToastTimerRef.current = setTimeout(() => setSampleLoaded(false), 3000);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setSubmitAttempted(true);

    if (errorCount > 0) {
      // Move focus smoothly to the first invalid field
      const firstInvalid = form?.find((item) => allErrors[item.name]);
      if (firstInvalid && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(
          `[name="${CSS.escape(firstInvalid.name)}"], #${CSS.escape(
            firstInvalid.name
          )}`
        );
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Clean text fields (trim whitespace) before sending
    const cleaned = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [
        k,
        typeof v === "string" ? v.trim() : v,
      ])
    );

    userFormInput(cleaned);
  };

  // Global Ctrl/Cmd + Enter submit shortcut across the entire form
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const describedBy = (item: FormItem) => {
    const ids: string[] = [];
    if (item.helperText || item.hint) ids.push(`${item.name}-help`);
    if (visibleErrors[item.name]) ids.push(`${item.name}-error`);
    return ids.length ? ids.join(" ") : undefined;
  };

  /* ------------------------------------------------------------------------ */
  /*                            Field Renderers                              */
  /* ------------------------------------------------------------------------ */

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
      case "input": {
        const textVal = String(value ?? "");
        return (
          <div className="relative">
            <input
              {...common}
              type="text"
              value={textVal}
              maxLength={item.maxLength}
              onChange={(e) => setValue(item.name, e.target.value)}
              placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
              autoComplete="off"
              className={`${baseFieldClasses} ${fieldStateClasses(hasError)} ${
                textVal ? "pr-9" : ""
              }`}
            />
            {textVal && (
              <button
                type="button"
                onClick={() => clearField(item.name, "")}
                title="Clear input"
                aria-label={`Clear ${item.label}`}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      }

      case "textarea": {
        const limit = item.maxLength ?? DEFAULT_TEXTAREA_LIMIT;
        const textVal = String(value ?? "");
        const length = textVal.length;
        const nearLimit = length > limit * 0.9;
        return (
          <div className="space-y-1.5">
            <div className="relative">
              <textarea
                {...common}
                rows={4}
                value={textVal}
                onChange={(e) => setValue(item.name, e.target.value)}
                placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
                className={`${baseFieldClasses} ${fieldStateClasses(
                  hasError
                )} resize-y min-h-[105px] leading-relaxed ${textVal ? "pr-9" : ""}`}
              />
              {textVal && (
                <button
                  type="button"
                  onClick={() => clearField(item.name, "")}
                  title="Clear text"
                  aria-label={`Clear ${item.label}`}
                  className="absolute right-2.5 top-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md bg-white/70 dark:bg-slate-900/70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-0.5">
              <span className="hidden sm:inline">
                Shortcut: <kbd className="font-mono font-medium">Ctrl/⌘ + Enter</kbd> to generate
              </span>
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

      case "number": {
        const numVal =
          value === "" || value === undefined || value === null
            ? ""
            : Number(value);
        const min = item.min;
        const max = item.max;
        const step = item.step ?? 1;

        const handleStep = (delta: number) => {
          markTouched(item.name);
          const current = typeof numVal === "number" && !isNaN(numVal) ? numVal : (min ?? 0);
          let next = current + delta;
          if (min !== undefined && next < min) next = min;
          if (max !== undefined && next > max) next = max;
          setValue(item.name, next);
        };

        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  {...common}
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={numVal}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setValue(item.name, raw === "" ? "" : Number(raw));
                  }}
                  placeholder={
                    item.placeholder ||
                    (min !== undefined && max !== undefined
                      ? `${min} – ${max}`
                      : "Enter number")
                  }
                  className={`${baseFieldClasses} ${fieldStateClasses(hasError)} tabular-nums`}
                />
              </div>

              {/* Stepper Buttons for best UX */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStep(-step)}
                  disabled={min !== undefined && typeof numVal === "number" && numVal <= min}
                  aria-label={`Decrease ${item.label}`}
                  className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(step)}
                  disabled={max !== undefined && typeof numVal === "number" && numVal >= max}
                  aria-label={`Increase ${item.label}`}
                  className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(min !== undefined || max !== undefined) && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <span>
                  Allowed range:{" "}
                  <strong className="text-slate-600 dark:text-slate-300">
                    {min ?? "–"} to {max ?? "–"}
                  </strong>
                </span>
              </div>
            )}
          </div>
        );
      }

      case "select": {
        // Multi-select pill selector
        if (item.multiple) {
          const rawArr = Array.isArray(value)
            ? value
            : typeof value === "string" && value
            ? [value]
            : [];
          const selectedSet = new Set(rawArr.map(String));
          const allOptions = (item.options || []).map(getOptionDetails);

          const toggleOption = (optVal: string) => {
            markTouched(item.name);
            const next = new Set(selectedSet);
            if (next.has(optVal)) {
              next.delete(optVal);
            } else {
              next.add(optVal);
            }
            setValue(item.name, Array.from(next));
          };

          const selectAll = () => {
            markTouched(item.name);
            setValue(item.name, allOptions.map((o) => o.value));
          };

          const clearAll = () => {
            markTouched(item.name);
            setValue(item.name, []);
          };

          return (
            <div
              className="space-y-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/40 p-3"
              role="group"
              aria-label={item.label}
              id={item.name}
            >
              {allOptions.length > 3 && (
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">
                    {selectedSet.size} of {allOptions.length} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <button
                      type="button"
                      onClick={clearAll}
                      disabled={selectedSet.size === 0}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-0.5">
                {allOptions.map((opt) => {
                  const isSelected = selectedSet.has(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => toggleOption(opt.value)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none
                        ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/25 ring-2 ring-indigo-500/30"
                            : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "border border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // Standard Single Select
        return (
          <div className="relative">
            <select
              {...common}
              value={String(value ?? "")}
              onChange={(e) => setValue(item.name, e.target.value)}
              className={`${baseFieldClasses} ${fieldStateClasses(
                hasError
              )} cursor-pointer appearance-none pr-9`}
            >
              <option value="" disabled>
                {item.placeholder || `Select ${item.label.toLowerCase()}...`}
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
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        );
      }

      case "radio": {
        const currentStr = String(value ?? "");
        const allOptions = (item.options || []).map(getOptionDetails);

        return (
          <div
            role="radiogroup"
            aria-label={item.label}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5"
            id={item.name}
          >
            {allOptions.map((opt) => {
              const isSelected = currentStr === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  name={item.name}
                  onClick={() => {
                    markTouched(item.name);
                    setValue(item.name, opt.value);
                  }}
                  className={`
                    flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none text-left
                    ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/80 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                        : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                    }
                  `}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        );
      }

      case "checkbox": {
        const isChecked = Boolean(value);
        return (
          <label
            htmlFor={item.name}
            className="group flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors cursor-pointer select-none"
          >
            <div className="relative flex items-center pt-0.5">
              <input
                {...common}
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setValue(item.name, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 cursor-pointer"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {item.placeholder || item.label}
              </span>
              {(item.helperText || item.hint) && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.helperText || item.hint}
                </p>
              )}
            </div>
          </label>
        );
      }

      case "range": {
        const min = item.min ?? 0;
        const max = item.max ?? 100;
        const current = Number(value ?? min);
        const percent = max === min ? 0 : Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100));

        return (
          <div className="space-y-2 pt-1 px-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Level:</span>
              <span className="font-semibold text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 tabular-nums">
                {current}
              </span>
            </div>
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
                background: `linear-gradient(to right, rgb(99 102 241) ${percent}%, rgb(203 213 225 / 0.5) ${percent}%)`,
              }}
              className="w-full h-2 rounded-lg cursor-pointer appearance-none accent-indigo-600 dark:accent-indigo-400"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
              <span>Min: {min}</span>
              <span>Max: {max}</span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                            Render Main                                  */
  /* ------------------------------------------------------------------------ */

  if (!form || form.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121324] border border-dashed border-slate-300 dark:border-[#1E2038] rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
        Select a template to configure parameters.
      </div>
    );
  }

  const submitDisabled = loading;

  return (
    <div className="bg-white dark:bg-[#121324] border border-slate-200 dark:border-[#1E2038] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header bar */}
      <div className="border-b border-slate-100 dark:border-[#1E2038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {selectedTemplate?.name ? `${selectedTemplate.name} — Parameters` : "Engine Parameters"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure prompt parameters for tailored Gemini AI generation.
          </p>
        </div>

        {/* Action buttons: Try Sample & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleFillExample}
            disabled={loading}
            title="Populate form with a realistic example"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Try Sample</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || loading}
            title="Reset form to defaults"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Notice: Sample Loaded feedback toast */}
      {sampleLoaded && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Loaded realistic sample parameters! Ready to generate.</span>
          </div>
          <button
            type="button"
            onClick={() => setSampleLoaded(false)}
            aria-label="Dismiss notice"
            className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Notice: Restored Draft notice */}
      {hasRestoredDraft && !sampleLoaded && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Restored your unsaved draft.</span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredDraft(false)}
            aria-label="Dismiss draft notice"
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        onKeyDown={handleFormKeyDown}
        noValidate
        aria-busy={loading}
        className="space-y-5"
      >
        <fieldset disabled={loading} className="space-y-5 border-0 p-0 m-0 min-w-0">
          {form.map((item) => {
            const helpText = item.helperText || item.hint;
            const hasError = Boolean(visibleErrors[item.name]);

            return (
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

                {/* Helper text or Hint */}
                {helpText && !hasError && item.field !== "checkbox" && (
                  <p
                    id={`${item.name}-help`}
                    className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1"
                  >
                    <Info className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                    <span>{helpText}</span>
                  </p>
                )}

                {/* Error message */}
                {hasError && (
                  <p
                    id={`${item.name}-error`}
                    role="alert"
                    className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium animate-in fade-in slide-in-from-top-0.5 duration-150"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{visibleErrors[item.name]}</span>
                  </p>
                )}
              </div>
            );
          })}
        </fieldset>

        {/* Submit & Stop Actions */}
        <div className="pt-2 space-y-2.5">
          {submitAttempted && errorCount > 0 && (
            <div
              role="alert"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Please check {errorCount} required {errorCount === 1 ? "field" : "fields"} highlighted above.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitDisabled}
              className={`
                flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
                focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30
                ${
                  submitDisabled
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.008] active:scale-[0.985] cursor-pointer"
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

            {/* Stop Generation Button when generating */}
            {loading && onStop && (
              <button
                type="button"
                onClick={onStop}
                title="Stop current generation"
                className="py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500">
            <span>Press <kbd className="font-mono font-medium">Ctrl + Enter</kbd> (or <kbd className="font-mono font-medium">⌘ + Enter</kbd>) to generate</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default React.memo(FormSection);

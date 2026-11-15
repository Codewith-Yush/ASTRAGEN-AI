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
  "w-full px-2.5 py-1.5 rounded-[6px] text-[13px] bg-surface text-ink border transition-colors duration-100 placeholder:text-ink-dim focus:outline-none focus:ring-[3px] focus:ring-action/15 disabled:opacity-60 disabled:cursor-not-allowed";

const fieldStateClasses = (hasError: boolean) =>
  hasError
    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
    : "border-border hover:border-border-subtle focus:border-action";

const chipBase =
  "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[6px] border text-[12px] transition-colors duration-100 cursor-pointer select-none";
const chipOn = "bg-surface-elevated border-ink-dim text-ink";
const chipOff =
  "bg-surface border-border text-ink-muted hover:text-ink hover:border-border-subtle";

const ghostBtn =
  "inline-flex items-center gap-1.5 h-7 px-2 rounded-[6px] text-[12px] text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

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
                textVal ? "pr-8" : ""
              }`}
            />
            {textVal && (
              <button
                type="button"
                onClick={() => clearField(item.name, "")}
                title="Clear"
                aria-label={`Clear ${item.label}`}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-ink-dim hover:text-ink transition-colors rounded-[4px]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
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
          <div className="space-y-1">
            <div className="relative">
              <textarea
                {...common}
                rows={4}
                value={textVal}
                onChange={(e) => setValue(item.name, e.target.value)}
                placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}...`}
                className={`${baseFieldClasses} ${fieldStateClasses(
                  hasError
                )} resize-y min-h-[96px] leading-relaxed ${textVal ? "pr-8" : ""}`}
              />
              {textVal && (
                <button
                  type="button"
                  onClick={() => clearField(item.name, "")}
                  title="Clear"
                  aria-label={`Clear ${item.label}`}
                  className="absolute right-1.5 top-1.5 p-1 text-ink-dim hover:text-ink transition-colors rounded-[4px] bg-surface/80"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className="flex justify-end text-[11px] text-ink-dim px-0.5">
              <span
                className={`tabular-nums font-mono ${
                  length > limit
                    ? "text-rose-500"
                    : nearLimit
                    ? "text-amber-500"
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

        const stepBtn =
          "h-[30px] w-[30px] inline-flex items-center justify-center rounded-[6px] border border-border bg-surface text-ink-muted hover:text-ink hover:border-border-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
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
                className={`${baseFieldClasses} ${fieldStateClasses(hasError)} tabular-nums font-mono flex-1`}
              />
              <button
                type="button"
                onClick={() => handleStep(-step)}
                disabled={min !== undefined && typeof numVal === "number" && numVal <= min}
                aria-label={`Decrease ${item.label}`}
                className={stepBtn}
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => handleStep(step)}
                disabled={max !== undefined && typeof numVal === "number" && numVal >= max}
                aria-label={`Increase ${item.label}`}
                className={stepBtn}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            {(min !== undefined || max !== undefined) && (
              <p className="text-[11px] text-ink-dim font-mono tabular-nums">
                range {min ?? "–"} … {max ?? "–"}
              </p>
            )}
          </div>
        );
      }

      case "select": {
        // Multi-select chips
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
            <div className="space-y-2" role="group" aria-label={item.label} id={item.name}>
              {allOptions.length > 3 && (
                <div className="flex items-center justify-between text-[11px] text-ink-dim">
                  <span className="tabular-nums">
                    {selectedSet.size}/{allOptions.length} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-ink-muted hover:text-ink underline-offset-2 hover:underline"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      disabled={selectedSet.size === 0}
                      className="text-ink-muted hover:text-ink underline-offset-2 hover:underline disabled:opacity-40 disabled:no-underline"
                    >
                      None
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {allOptions.map((opt) => {
                  const isSelected = selectedSet.has(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => toggleOption(opt.value)}
                      className={`${chipBase} ${isSelected ? chipOn : chipOff}`}
                    >
                      {isSelected && <Check className="w-3 h-3" strokeWidth={2} />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // Standard single select
        return (
          <div className="relative">
            <select
              {...common}
              value={String(value ?? "")}
              onChange={(e) => setValue(item.name, e.target.value)}
              className={`${baseFieldClasses} ${fieldStateClasses(
                hasError
              )} cursor-pointer appearance-none pr-8`}
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
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-dim"
              strokeWidth={1.5}
            />
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
            className="flex flex-wrap gap-1.5"
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
                  className={`${chipBase} ${isSelected ? chipOn : chipOff}`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-ink" : "border-border-subtle"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
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
            className="group flex items-start gap-2.5 py-1 cursor-pointer select-none"
          >
            <input
              {...common}
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setValue(item.name, e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded-[4px] border-border-subtle accent-[var(--ink)] cursor-pointer"
            />
            <span className="space-y-0.5">
              <span className="block text-[13px] text-ink">{item.placeholder || item.label}</span>
              {(item.helperText || item.hint) && (
                <span className="block text-[11px] text-ink-dim">
                  {item.helperText || item.hint}
                </span>
              )}
            </span>
          </label>
        );
      }

      case "range": {
        const min = item.min ?? 0;
        const max = item.max ?? 100;
        const current = Number(value ?? min);
        const percent =
          max === min ? 0 : Math.max(0, Math.min(100, ((current - min) / (max - min)) * 100));

        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
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
                  background: `linear-gradient(to right, var(--ink-muted) ${percent}%, var(--border) ${percent}%)`,
                }}
                className="flex-1 h-1 rounded-full cursor-pointer appearance-none accent-[var(--ink)]"
              />
              <span className="min-w-[2.25rem] text-right font-mono text-[12px] tabular-nums text-ink">
                {current}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-ink-dim font-mono tabular-nums">
              <span>{min}</span>
              <span>{max}</span>
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
      <div className="flex h-full items-center justify-center bg-surface p-8 text-center text-[13px] text-ink-muted">
        Select a template to configure parameters.
      </div>
    );
  }

  const submitDisabled = loading;

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Panel header */}
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <h2 className="truncate text-[13px] font-medium text-ink">
          {selectedTemplate?.name || "Parameters"}
        </h2>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={handleFillExample}
            disabled={loading}
            title="Fill the form with an example"
            className={ghostBtn}
          >
            <Wand2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Sample</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || loading}
            title="Reset to defaults"
            className={ghostBtn}
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        onKeyDown={handleFormKeyDown}
        noValidate
        aria-busy={loading}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* Scrollable fields */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {sampleLoaded && (
            <div
              role="status"
              className="mb-4 flex items-center justify-between gap-2 rounded-[6px] border border-border bg-surface-elevated px-2.5 py-1.5 text-[12px] text-ink-muted"
            >
              <span>Sample values loaded.</span>
              <button
                type="button"
                onClick={() => setSampleLoaded(false)}
                aria-label="Dismiss notice"
                className="p-0.5 text-ink-dim hover:text-ink"
              >
                <X className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {hasRestoredDraft && !sampleLoaded && (
            <div
              role="status"
              className="mb-4 flex items-center justify-between gap-2 rounded-[6px] border border-border bg-surface-elevated px-2.5 py-1.5 text-[12px] text-ink-muted"
            >
              <span className="inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-ink-dim" strokeWidth={1.5} />
                Draft restored.
              </span>
              <button
                type="button"
                onClick={() => setHasRestoredDraft(false)}
                aria-label="Dismiss draft notice"
                className="p-0.5 text-ink-dim hover:text-ink"
              >
                <X className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          )}

          <fieldset disabled={loading} className="m-0 min-w-0 space-y-4 border-0 p-0">
            {form.map((item) => {
              const helpText = item.helperText || item.hint;
              const hasError = Boolean(visibleErrors[item.name]);

              return (
                <div key={item.name} className="space-y-1.5">
                  {item.field !== "checkbox" && (
                    <label
                      htmlFor={item.name}
                      className="flex items-baseline gap-1.5 text-[12px] font-medium text-ink"
                    >
                      {item.label}
                      {!item.required && (
                        <span className="font-normal text-ink-dim">optional</span>
                      )}
                    </label>
                  )}

                  {renderField(item)}

                  {helpText && !hasError && item.field !== "checkbox" && (
                    <p id={`${item.name}-help`} className="text-[11px] leading-snug text-ink-dim">
                      {helpText}
                    </p>
                  )}

                  {hasError && (
                    <p
                      id={`${item.name}-error`}
                      role="alert"
                      className="flex items-center gap-1.5 text-[11px] text-rose-500"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      <span>{visibleErrors[item.name]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </fieldset>
        </div>

        {/* Sticky action bar */}
        <div className="shrink-0 space-y-2 border-t border-border bg-surface px-4 py-3">
          {submitAttempted && errorCount > 0 && (
            <p role="alert" className="flex items-center gap-1.5 text-[12px] text-rose-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              {errorCount} required {errorCount === 1 ? "field needs" : "fields need"} attention.
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitDisabled}
              className={`inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-[6px] text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-action/30 ${
                submitDisabled
                  ? "cursor-not-allowed border border-border bg-surface-elevated text-ink-dim"
                  : "cursor-pointer bg-action text-action-ink hover:bg-action-hover"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <span>Generate</span>
                  <kbd className="rounded-[4px] bg-white/20 px-1 font-mono text-[10px] leading-4">
                    Ctrl ↵
                  </kbd>
                </>
              )}
            </button>

            {loading && onStop && (
              <button
                type="button"
                onClick={onStop}
                title="Stop generation"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] border border-border bg-surface px-3 text-[13px] text-ink hover:border-border-subtle hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" strokeWidth={1.5} />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default React.memo(FormSection);
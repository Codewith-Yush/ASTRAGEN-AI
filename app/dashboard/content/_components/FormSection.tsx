"use client";
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2Icon, SparklesIcon } from 'lucide-react';

// Define the structure of a form item
interface FormOption {
  value: string;
  label: string;
}

interface FormItem {
  field: 'input' | 'textarea' | 'select' | 'checkbox' | 'range';
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
  const [focused, setFocused] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialize form data based on template
  useEffect(() => {
    if (selectedTemplate?.form) {
      const initialData = selectedTemplate.form.reduce((acc, item) => {
        let initialValue: string | number | boolean = '';
        
        if (item.field === 'checkbox') {
          initialValue = item.initialValue ?? false;
        } else if (item.field === 'range') {
          initialValue = item.initialValue ?? item.min ?? 0;
        } else if (item.field === 'select') {
          if (item.options && item.options.length > 0) {
            initialValue = item.initialValue ?? 
              (typeof item.options[0] === 'string' 
                ? item.options[0] 
                : (item.options[0] as FormOption).value);
          } else {
            initialValue = '';
          }
        } else {
          initialValue = item.initialValue ?? '';
        }
        
        return { ...acc, [item.name]: initialValue };
      }, {});
      setFormData(initialData);
      setIsFormValid(validateForm(initialData));
    }
  }, [selectedTemplate]);

  // Validate form inputs
  const validateForm = (data: { [key: string]: any }) => {
    const newErrors: { [key: string]: string } = {};
    selectedTemplate?.form?.forEach((item) => {
      const value = data[item.name];
      if (item.required && (value === undefined || value === null || 
          (typeof value === 'string' && !value.trim()))) {
        newErrors[item.name] = `${item.label} is required`;
      }
      if (item.field === 'textarea' && value?.length > 2000) {
        newErrors[item.name] = 'Maximum 2000 characters allowed';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Unified handler for input, textarea, and select changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    isCheckbox: boolean = false
  ) => {
    const { name, value, checked } = event.target as any;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: isCheckbox ? checked : value
      };
      setIsFormValid(validateForm(newData));
      return newData;
    });
  };

  // Handle range changes
  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: parseInt(value, 10) };
      setIsFormValid(validateForm(newData));
      return newData;
    });
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm(formData)) {
      userFormInput(formData);
    }
  };

  // Helper function to get option value and label
  const getOptionDetails = (option: string | FormOption) => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:shadow-3xl">
      {selectedTemplate && (
        <div className="mb-10 text-center space-y-5">
          {selectedTemplate.icon && (
            <div className="flex justify-center">
              <div className="relative bg-gradient-to-r from-teal-400 to-cyan-500 p-5 rounded-2xl shadow-lg animate-pulse-slow">
                <SparklesIcon className="text-white w-12 h-12" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 opacity-50 blur-md"></div>
              </div>
            </div>
          )}
          <h2 className="text-4xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-600">
            {selectedTemplate.name}
          </h2>
          <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            {selectedTemplate.desc}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {selectedTemplate?.form?.map((item, index) => (
          <div key={index} className="relative group transition-all duration-300">
            <label 
              htmlFor={item.name}
              className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide"
            >
              {item.label}
              {item.required && <span className="text-rose-500 ml-1">*</span>}
            </label>

            {item.field === 'input' && (
              <Input
                id={item.name}
                type="text"
                name={item.name}
                value={formData[item.name] || ''}
                onChange={handleChange}
                onFocus={() => setFocused({ ...focused, [item.name]: true })}
                onBlur={() => setFocused({ ...focused, [item.name]: false })}
                className={`w-full px-5 py-3 rounded-xl bg-white/80 border-2 transition-all duration-300
                    ${focused[item.name] ? 'border-teal-400 ring-4 ring-teal-200' : 'border-gray-200'}
                    ${errors[item.name] ? 'border-rose-400 ring-4 ring-rose-200' : ''}
                    focus:outline-none focus:ring-4 focus:ring-teal-200 hover:border-teal-300`}
                placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}`}
                aria-describedby={`${item.name}-error`}
                required={item.required}
              />
            )}

            {item.field === 'textarea' && (
              <div className="relative">
                <Textarea
                  id={item.name}
                  name={item.name}
                  value={formData[item.name] || ''}
                  onChange={handleChange}
                  onFocus={() => setFocused({ ...focused, [item.name]: true })}
                  onBlur={() => setFocused({ ...focused, [item.name]: false })}
                  className={`w-full px-5 py-3 min-h-40 rounded-xl bg-white/80 border-2 transition-all duration-300 resize-none
                      ${focused[item.name] ? 'border-teal-400 ring-4 ring-teal-200' : 'border-gray-200'}
                      ${errors[item.name] ? 'border-rose-400 ring-4 ring-rose-200' : ''}
                      focus:outline-none focus:ring-4 focus:ring-teal-200 hover:border-teal-300`}
                  placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}`}
                  aria-describedby={`${item.name}-error`}
                  required={item.required}
                />
                <div className="flex justify-between mt-3">
                  <span className="text-xs text-gray-400">
                    {formData[item.name]?.length || 0}/2000 characters
                  </span>
                </div>
              </div>
            )}

            {item.field === 'select' && (
              <select
                id={item.name}
                name={item.name}
                value={formData[item.name] || ''}
                onChange={handleChange}
                onFocus={() => setFocused({ ...focused, [item.name]: true })}
                onBlur={() => setFocused({ ...focused, [item.name]: false })}
                className={`w-full px-5 py-3 rounded-xl bg-white/80 border-2 transition-all duration-300
                    ${focused[item.name] ? 'border-teal-400 ring-4 ring-teal-200' : 'border-gray-200'}
                    ${errors[item.name] ? 'border-rose-400 ring-4 ring-rose-200' : ''}
                    focus:outline-none focus:ring-4 focus:ring-teal-200 hover:border-teal-300 appearance-none cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJ0ZXh0LWdyYXktNDAwIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[right_1rem_center] bg-[length:1rem]`}
                aria-describedby={`${item.name}-error`}
                required={item.required}
              >
                <option value="" disabled>
                  Select {item.label.toLowerCase()}
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

            {item.field === 'checkbox' && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={item.name}
                  name={item.name}
                  checked={formData[item.name] || false}
                  onChange={(e) => handleChange(e, true)}
                  className="h-6 w-6 rounded-md border-2 border-gray-200 text-teal-500 focus:ring-teal-300 transition-all duration-200"
                />
                <label 
                  htmlFor={item.name}
                  className="text-sm text-gray-600 font-medium"
                >
                  {item.placeholder || 'Yes'}
                </label>
              </div>
            )}

            {item.field === 'range' && (
              <div className="space-y-4">
                <input
                  type="range"
                  id={item.name}
                  name={item.name}
                  min={item.min || 0}
                  max={item.max || 100}
                  step={1}
                  value={formData[item.name] || item.min || 0}
                  onChange={handleRangeChange}
                  className="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:duration-200 hover:[&::-webkit-slider-thumb]:bg-teal-600
                      focus:outline-none focus:ring-4 focus:ring-teal-200"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{item.min || 0}</span>
                  <span>Current: {formData[item.name]}</span>
                  <span>{item.max || 100}</span>
                </div>
              </div>
            )}

            {errors[item.name] && (
              <p 
                id={`${item.name}-error`} 
                className="mt-2 text-xs text-rose-500 font-medium animate-fade-in"
              >
                {errors[item.name]}
              </p>
            )}
          </div>
        ))}

        <Button
          type="button"
          onClick={onSubmit}
          className="w-full py-4 mt-10 flex items-center justify-center gap-3 
              bg-gradient-to-r from-teal-500 to-cyan-600 
              hover:from-teal-600 hover:to-cyan-700
              text-white font-bold text-lg
              rounded-xl
              transition-all duration-500 
              shadow-xl hover:shadow-2xl
              disabled:opacity-50 disabled:cursor-not-allowed
              relative overflow-hidden group"
          disabled={loading || !isFormValid}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></span>
          {loading ? (
            <Loader2Icon className="animate-spin w-6 h-6" />
          ) : (
            <SparklesIcon className="w-6 h-6 animate-pulse" />
          )}
          <span className="relative z-10">{loading ? 'Generating...' : 'Generate Content'}</span>
        </Button>
      </div>
    </div>
  );
}

export default FormSection;
"use client";
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2Icon, SparklesIcon } from 'lucide-react';

// Define the structure of a form item
interface FormItem {
    field: 'input' | 'textarea' | 'select' | 'checkbox' | 'range';
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
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
                    initialValue = item.initialValue ?? item.options?.[0] ?? '';
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

    return (
        <div className="max-w-lg mx-auto p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
            {selectedTemplate && (
                <div className="mb-8 text-center space-y-4">
                    {selectedTemplate.icon && (
                        <div className="flex justify-center">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg">
                                <SparklesIcon className="text-white w-10 h-10" />
                            </div>
                        </div>
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {selectedTemplate.name}
                    </h2>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                        {selectedTemplate.desc}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {selectedTemplate?.form?.map((item, index) => (
                    <div key={index} className="relative group">
                        <label 
                            htmlFor={item.name}
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {item.label}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
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
                                className={`w-full px-4 py-3 rounded-lg bg-gray-50 transition-all duration-200
                                    ${focused[item.name] ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}
                                    ${errors[item.name] ? 'border-red-500' : ''}`}
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
                                    className={`w-full px-4 py-3 min-h-36 rounded-lg bg-gray-50 transition-all duration-200 resize-none
                                        ${focused[item.name] ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}
                                        ${errors[item.name] ? 'border-red-500' : ''}`}
                                    placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}`}
                                    aria-describedby={`${item.name}-error`}
                                    required={item.required}
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-500">
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
                                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border transition-all duration-200
                                    ${focused[item.name] ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}
                                    ${errors[item.name] ? 'border-red-500' : ''}`}
                                aria-describedby={`${item.name}-error`}
                                required={item.required}
                            >
                                <option value="" disabled>
                                    Select {item.label.toLowerCase()}
                                </option>
                                {item.options?.map((option, i) => (
                                    <option key={i} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        )}

                        {item.field === 'checkbox' && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={item.name}
                                    name={item.name}
                                    checked={formData[item.name] || false}
                                    onChange={(e) => handleChange(e, true)}
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label 
                                    htmlFor={item.name}
                                    className="text-sm text-gray-600"
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
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{item.min || 0}</span>
                                    <span>Current: {formData[item.name]}</span>
                                    <span>{item.max || 100}</span>
                                </div>
                            </div>
                        )}

                        {errors[item.name] && (
                            <p 
                                id={`${item.name}-error`} 
                                className="mt-1 text-xs text-red-500"
                            >
                                {errors[item.name]}
                            </p>
                        )}
                    </div>
                ))}

                <Button
                    type="button"
                    onClick={onSubmit}
                    className="w-full py-3 mt-8 flex items-center justify-center gap-3 
                        bg-gradient-to-r from-indigo-500 to-purple-600 
                        hover:from-indigo-600 hover:to-purple-700
                        text-white font-semibold text-lg
                        rounded-lg
                        transition-all duration-300 
                        shadow-lg hover:shadow-xl
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !isFormValid}
                >
                    {loading ? (
                        <Loader2Icon className="animate-spin w-6 h-6" />
                    ) : (
                        <SparklesIcon className="w-6 h-6" />
                    )}
                    <span>{loading ? 'Generating...' : 'Generate Content'}</span>
                </Button>
            </div>
        </div>
    );
}

export default FormSection;
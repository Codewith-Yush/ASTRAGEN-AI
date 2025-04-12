"use client";
import React, { useState } from 'react';
import { TEMPLATE } from '../../_components/TemplateListSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2Icon, SparklesIcon } from 'lucide-react';

interface PROPS {
    selectedTemplate?: TEMPLATE;
    userFormInput: (data: any) => void;
    loading: boolean;
}

function FormSection({ selectedTemplate, userFormInput, loading }: PROPS) {
    const [formData, setFormData] = useState({});
    const [focused, setFocused] = useState<{ [key: string]: boolean }>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        userFormInput(formData);
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-0 transition-all duration-300">
            {selectedTemplate && (
                <div className="mb-8 space-y-3">
                    {selectedTemplate.icon && (
                        <div className="flex justify-center mb-6">
                            <div className="bg-indigo-500 p-3 rounded-lg shadow-md">
                                <SparklesIcon className="text-white w-8 h-8" />
                            </div>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800 text-center">
                        {selectedTemplate.name}
                    </h2>
                    <p className="text-sm text-gray-500 text-center">{selectedTemplate.desc}</p>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                {selectedTemplate?.form?.map((item, index) => (
                    <div key={index} className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            {item.label}
                        </label>
                        {item.field === 'input' ? (
                            <Input
                                type="text"
                                name={item.name}
                                onChange={handleInputChange}
                                onFocus={() => setFocused({...focused, [item.name]: true})}
                                onBlur={() => setFocused({...focused, [item.name]: false})}
                                className={`w-full transition-all duration-200 bg-gray-50
                                    ${focused[item.name] 
                                        ? 'ring-1 ring-indigo-400 border-indigo-400' 
                                        : 'border-gray-200'
                                    }`}
                                placeholder={`Enter ${item.label.toLowerCase()}`}
                            />
                        ) : item.field === 'textarea' ? (
                            <div className="relative">
                                <Textarea
                                    name={item.name}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocused({...focused, [item.name]: true})}
                                    onBlur={() => setFocused({...focused, [item.name]: false})}
                                    className={`w-full min-h-32 transition-all duration-200 bg-gray-50 resize-none
                                        ${focused[item.name] 
                                            ? 'ring-1 ring-indigo-400 border-indigo-400' 
                                            : 'border-gray-200'
                                        }`}
                                    placeholder={`Enter ${item.label.toLowerCase()}`}
                                />
                                <span className="text-xs text-gray-400 absolute -bottom-6 left-0">
                                    Max 2000 words
                                </span>
                            </div>
                        ) : null}
                    </div>
                ))}
                
                <Button
                    type="submit"
                    className="w-full py-4 mt-8 flex items-center justify-center gap-2 
                        bg-indigo-500 hover:bg-indigo-600
                        text-white font-medium
                        transition-all duration-200 
                        shadow-md hover:shadow-lg"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2Icon className="animate-spin w-5 h-5" />
                    ) : (
                        <SparklesIcon className="w-5 h-5" />
                    )}
                    <span className="ml-1">{loading ? 'Generating...' : 'Generate Content'}</span>
                </Button>
            </form>
        </div>
    );
}

export default FormSection;
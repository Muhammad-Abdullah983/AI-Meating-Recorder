"use client";

import { forwardRef } from "react";

const FormSelect = forwardRef(({
    label,
    error,
    required = false,
    options = [],
    placeholder = "Select an option",
    className = "",
    ...props
}, ref) => {
    return (
        <div className="text-black">
            {label && (
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                ref={ref}
                className={`w-full border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    } p-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white ${className}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span> {error}
                </p>
            )}
        </div>
    );
});

FormSelect.displayName = "FormSelect";

export default FormSelect;

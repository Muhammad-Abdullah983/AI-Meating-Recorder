"use client";

import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const FormInput = forwardRef(({
    label,
    error,
    type = "text",
    required = false,
    icon: Icon,
    showPasswordToggle = false,
    showPassword,
    onTogglePassword,
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
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`w-full border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        } p-3 ${Icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-10' : ''
                        } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white ${className}`}
                    {...props}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span> {error}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = "FormInput";

export default FormInput;

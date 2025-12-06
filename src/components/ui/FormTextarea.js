"use client";

import { forwardRef } from "react";

const FormTextarea = forwardRef(({
    label,
    error,
    required = false,
    rows = 4,
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
            <textarea
                ref={ref}
                rows={rows}
                className={`w-full border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    } p-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition bg-gray-50 hover:bg-white resize-none ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span> {error}
                </p>
            )}
        </div>
    );
});

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;

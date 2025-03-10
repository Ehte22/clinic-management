import React from 'react'
import { IFieldProps } from './useDynamicForm'

const Radios: React.FC<IFieldProps> = ({ controllerField, field }) => {
    return <>
        <fieldset>
            <legend className="text-sm/6 font-semibold text-gray-900">{field.legend}</legend>
            <p className="mt-1 text-sm/6 text-gray-600">{field.text}</p>
            <div className="mt-4 space-y-6 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                {field.options?.map((option) => (
                    <div key={`radio-${option.value}`} className="flex items-center">
                        <input
                            id={`radio-${option.value}`}
                            type="radio"
                            value={option.value}
                            className={`relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden ${field.className}`}
                            checked={controllerField.value === option.value}
                            onChange={(e) => controllerField.onChange(e.target.value)}
                        />
                        <label htmlFor={`radio-${option.value}`} className="ml-3 block text-sm/6 font-medium text-gray-900">
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </fieldset>
    </>
}

export default Radios
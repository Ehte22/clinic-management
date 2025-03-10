import React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { IFieldProps } from './useDynamicForm';

const Inputs: React.FC<IFieldProps> = ({ controllerField, field, errors, disabled }) => {
    const isError = Boolean(errors)

    return <>
        <div className='mt-2'>
            <div className={isError ? "mt-2 grid grid-cols-1" : ""}>
                <input
                    {...controllerField}
                    type={field.type}
                    className={isError
                        ? "col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-3 pr-10 text-base text-red-900 outline outline-1 -outline-offset-1 outline-red-300 placeholder:text-red-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:pr-9 sm:text-sm/6"
                        : `block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${field.className}`}
                    placeholder={field.placeholder}
                    id={field.name}
                    disabled={disabled}
                />
                {isError && <ExclamationCircleIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4"
                />}
            </div>
            <p id={field.name} className="mt-2 text-sm text-gray-500">
                {field.text}
            </p>
        </div>
    </>
}

export default Inputs
import React from 'react'
import { IFieldProps } from './useDynamicForm'

const Textarea: React.FC<IFieldProps> = ({ controllerField, field }) => {
    return <>
        <div className='my-2'>
            <textarea
                {...controllerField}
                id={field.name}
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${field.className}`}
                placeholder={field.placeholder}
                rows={field.rows}
                cols={field.cols}
            ></textarea>
        </div>
    </>
}

export default Textarea
import React from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import { IFieldProps } from './useDynamicForm'

const Selects: React.FC<IFieldProps> = ({ controllerField, field }) => {

    return <>
        <div id={field.name} className='my-2'>
            <Listbox  {...controllerField} value={controllerField.value} onChange={controllerField.onChange}>
                <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                        <span className="col-start-1 row-start-1 truncate pr-6">{controllerField.value || (field.options as any)[0]?.label}</span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </ListboxButton>

                    <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                    >
                        {field.options && field.options.length > 0
                            ? <div>
                                {
                                    field.options?.map((item, i) => (
                                        i !== 0 && <ListboxOption
                                            disabled={item.disabled}
                                            key={i}
                                            value={item.label}
                                            className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                                        >
                                            <span className="block truncate font-normal group-data-[selected]:font-semibold">{item.label}</span>

                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                                <CheckIcon aria-hidden="true" className="size-5" />
                                            </span>
                                        </ListboxOption>
                                    ))
                                }
                            </div>
                            : <div className="text-center py-2 font-semibold">No {field.label || "Data"} Found</div>
                        }
                    </ListboxOptions>
                </div>
            </Listbox >
        </div >
    </>
}

export default Selects
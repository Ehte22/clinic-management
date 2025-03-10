import React, { useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { CheckIcon } from '@heroicons/react/20/solid';
import { IFieldProps } from './useDynamicForm';

const SearchSelect: React.FC<IFieldProps> = ({ controllerField, field }) => {
    const [query, setQuery] = useState('');

    const filteredOptions = field.options?.filter(option =>
        option.label && option.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div id={field.name} className="my-2">
            <Listbox {...controllerField} value={controllerField.value} onChange={(value) => {
                if (value) {
                    controllerField.onChange(value);
                }
            }}>
                <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300  focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6">
                        <span className="col-start-1 row-start-1 truncate pr-6">
                            {controllerField.value || (field.options as any)[0]?.label}
                        </span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </ListboxButton>

                    <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none"
                    >
                        <div className="relative p-2">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-cyan-600 sm:text-sm/6"
                            />
                        </div>

                        {filteredOptions && filteredOptions?.length > 0 ? (
                            filteredOptions.map((item, i) => (
                                <ListboxOption
                                    disabled={item.disabled}
                                    key={i}
                                    value={item.value}
                                    className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-cyan-600 data-[focus]:text-white"
                                >
                                    <span className="block truncate font-normal group-data-[selected]:font-semibold">
                                        {item.label}
                                    </span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-cyan-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                        <CheckIcon aria-hidden="true" className="size-5" />
                                    </span>
                                </ListboxOption>
                            ))
                        ) : (
                            <p className="px-4 py-2 text-gray-500">No options found</p>
                        )}
                    </ListboxOptions>
                </div>
            </Listbox>
        </div>
    );
};

export default SearchSelect;

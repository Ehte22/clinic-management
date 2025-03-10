import { IFieldProps } from "./useDynamicForm";

const Checkboxes: React.FC<IFieldProps> = ({ controllerField, field }) => {
    return (
        <div className={`my-2 ${field.className}`}>
            <fieldset>
                <legend className="sr-only">{field.legend}</legend>
                <div key={field.name} className="grid grid-cols-12 gap-4">
                    {field.options?.map((option) => (
                        <div key={option.value} className={`${option.className || "col-span-12"} flex gap-3`}>
                            <div className="flex h-6 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                    <input
                                        id={`checkbox-${option.value}`}
                                        type="checkbox"
                                        value={option.value}
                                        className={`col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto`}
                                        onChange={(e) => {
                                            const newValue = controllerField.value || [];
                                            if (e.target.checked) {
                                                controllerField.onChange([...newValue, option.value]);
                                            } else {
                                                controllerField.onChange(
                                                    newValue.filter((val: string | number) => val !== option.value)
                                                );
                                            }
                                        }}
                                    />
                                    <svg
                                        fill="none"
                                        viewBox="0 0 14 14"
                                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                                    >
                                        <path
                                            d="M3 8L6 11L11 3.5"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-[:checked]:opacity-100"
                                        />
                                        <path
                                            d="M3 7H11"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-sm/6">
                                <label htmlFor={`checkbox-${option.value}`} className="font-medium text-gray-900">
                                    {option.label}
                                </label>
                                {option.description && (
                                    <p id={`checkbox-${option.value}`} className="text-gray-500">
                                        {option.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

export default Checkboxes;

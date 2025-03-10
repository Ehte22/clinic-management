import { ValidationRules } from "./validationRules.interface";

export interface FieldConfig {
    name: string;
    label?: string;
    type: "text" | "password" | "email" | "number" | "color" | "range" | "date" | "time" | "select" | "radio" | "checkbox" | "file" | "textarea" | "formGroup" | "formArray" | "submit" | "searchSelect";
    placeholder?: string;
    options?: { name?: string | number, label?: string; value?: string | number, description?: string | number, disabled?: boolean, className?: string }[];
    className?: string
    accept?: string
    multiple?: boolean
    displayName?: string
    legend?: string
    text?: string
    rows?: number
    cols?: number
    formArray?: FieldConfig[],
    formGroup?: {
        [key: string]: FieldConfig
    },
    object?: boolean
    rules: ValidationRules
}
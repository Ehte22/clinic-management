export interface ValidationRules {
    required?: boolean;
    file?: boolean;
    checkbox?: boolean;
    accept?: string[];
    maxSize?: number;
    email?: boolean;
    pattern?: RegExp;
    patternMessage?: string
    min?: number;
    max?: number;
    object?: boolean
    number?: boolean
    label?: string
};

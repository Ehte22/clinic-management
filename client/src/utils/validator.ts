import { z } from "zod"
import { FieldConfig } from "../hooks/useDynamicForm";

export interface ValidationRules {
    required?: boolean;
    file?: boolean;
    array?: boolean;
    object?: boolean
    accept?: string[];
    maxSize?: number;
    email?: boolean;
    pattern?: RegExp;
    patternMessage?: string
    min?: number;
    max?: number;
    number?: boolean
    label?: string
};


export interface ExtractedRule {
    name: string
    label?: string;
    rules: ValidationRules | ExtractedRule[];
}

const generateSchema = (fieldLabel: string, rules: ValidationRules) => {

    let schema: z.ZodTypeAny;

    if (Array.isArray(rules)) {
        schema = z.array(z.object(generateArrayOfObjectSchema(rules)))
    } else if (rules.file) {

        schema = z.union([
            z.instanceof(File),
            z.instanceof(FileList),
            z.string(),
        ]);

        if (rules.required) {
            schema = schema.refine((files: FileList | File) => {
                if (files instanceof FileList) {
                    return files.length > 0;
                }
                return files instanceof File && files !== null;
            }, {
                message: `${fieldLabel} is required`,
            });
        }

        if (rules.accept) {
            schema = schema.refine((files: FileList | File) => {
                if (files instanceof FileList && files.length > 0) {
                    return Array.from(files).every((file) =>
                        rules.accept?.includes(file.type)
                    );
                }
                if (files instanceof File) {
                    return rules.accept?.includes(files.type);
                }
                return true;
            }, {
                message: `${fieldLabel} must be of type ${rules.accept.join(", ")}`,
            });
        }

        if (rules.maxSize) {
            const sizeInBytes = rules.maxSize * 1024 * 1024;
            schema = schema.refine((files: FileList | File) => {
                if (files instanceof FileList && files.length > 0) {
                    return Array.from(files).every((file) => file.size <= sizeInBytes);
                }
                if (files instanceof File) {
                    return files.size <= sizeInBytes;
                }
                return true;
            }, {
                message: `${fieldLabel} must be smaller than ${rules.maxSize}MB`,
            });
        }
    } else if (rules.array) {
        schema = z.union([
            z.array(z.string()),
            z.array(z.number()),
            z.string(),
        ]);

        if (rules.required) {
            schema = schema.refine((values: string[] | string) => values.length > 0, {
                message: `${fieldLabel} is required`,
            });
        }
    }
    else if (rules.object) {
        schema = z.object(generateObjectSchema(rules))
    }
    else {
        schema = z.string()

        if (rules.required) {
            schema = schema.refine(
                (value) => value !== undefined && value !== "",
                { message: `Field ${fieldLabel} is required` }
            );
        } else {
            schema = schema.optional();
        }

        if (rules.email) {
            schema = schema.refine((value) => {
                if (value) {
                    return z.string().email().safeParse(value).success
                } else {
                    return true
                }
            }, {
                message: "Please enter a valid email address"
            })
        }

        if (rules.pattern) {
            schema = schema.refine((value) => {
                if (value) {
                    return rules.pattern && rules.pattern.test(value)
                } else {
                    return true
                }
            }, {
                message: rules.patternMessage ? rules.patternMessage : `Invalid format for ${fieldLabel}`
            })
        }

        if (rules.min) {
            schema = schema.refine((value) => {
                if (value) {
                    return rules.min && (value.length >= rules.min)
                } else {
                    return true
                }
            }, {
                message: `${fieldLabel} must be at least ${rules.min} characters`
            })
        }

        if (rules.max) {
            schema = schema.refine((value) => {
                if (value) {
                    return rules.max && (value.length <= rules.max)
                } else {
                    return true
                }
            }, {
                message: `${fieldLabel} must be at most ${rules.max} characters`
            })
        }

    }
    return schema;
};

const generateArrayOfObjectSchema = (rules: { name: string; label: string, rules: ValidationRules }[]) => {
    const schemaObj: Record<string, z.ZodTypeAny> = {};

    for (const item of rules) {
        schemaObj[item.name] = generateSchema(item.label, item.rules);
    }

    return schemaObj;
};

const generateObjectSchema = (rules: Record<string, any>) => {
    const schemaObj: Record<string, z.ZodTypeAny> = {};

    Object.keys(rules).forEach((key) => {
        if (key !== "object") {
            schemaObj[key] = generateSchema(rules[key].label, rules[key]);
        }
    });

    return schemaObj;
};

export const customValidator = (fields: FieldConfig[]) => {
    // Extract rules from fields and nested structures
    const extractRules = (fields: FieldConfig[]): ExtractedRule[] => {
        return fields.map((item: FieldConfig) => {
            if (!item.formArray && !item.formGroup) {
                return {
                    name: item.name,
                    label: item.placeholder?.toLowerCase(),
                    rules: item.rules,
                };
            }

            if (item.formGroup) {
                const nestedRules: Record<string, ValidationRules> = {};
                Object.values(item.formGroup).forEach((nestedField) => {
                    nestedRules[nestedField.name] = {
                        ...nestedField.rules,
                        label: nestedField.placeholder?.toLowerCase()
                    }
                });

                return {
                    name: item.name,
                    label: item.placeholder?.toLowerCase(),
                    rules: { object: true, ...nestedRules },
                };
            }

            if (item.formArray) {
                const nestedRules = extractRules(item.formArray);
                return {
                    name: item.name,
                    label: item.placeholder?.toLowerCase(),
                    rules: nestedRules,
                };
            }

            return { name: item.name, label: item.label, rules: item.rules, type: item.type };
        });
    };

    // Extract rules
    const rules = extractRules(fields);

    // Generate schema from rules
    const schemaObj: Record<string, z.ZodTypeAny> = {};
    for (const item of rules) {
        schemaObj[item.name] = generateSchema(item.label ?? item.name, item.rules as ValidationRules);
    }

    return z.object(schemaObj);
};

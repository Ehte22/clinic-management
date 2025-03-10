import { z } from "zod";

export interface validationRulesSchema {
    [key: string]: ValidationRules | ValidationRules[],
}

export interface ValidationRules {
    required?: boolean;
    file?: boolean;
    checkbox?: boolean;
    accept?: string[];
    maxSize?: number;
    email?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    object?: boolean;
    type?: string

    [key: string]: ValidationRules | any
};

const generateSchema = (fieldName: string, rules: ValidationRules) => {

    let schema: z.ZodTypeAny

    if (Array.isArray(rules)) {
        schema = z.array(z.object(generateObjectSchema(rules[0])))
    } else if (rules.checkbox) {
        schema = z.union([
            z.array(z.string()),
            z.array(z.number()),
            z.string(),
        ]);

        if (rules.required) {
            schema = schema.refine((values: string[] | number[] | string) => values.length > 0, {
                message: ` ${fieldName} are required`,
            });
        }
    } else if (rules.object) {
        schema = z.object(generateObjectSchema(rules))
    } else {

        if (rules.type === 'number') {
            schema = z
                .union([z.number(), z.string().length(0)]) // Accept number or empty string
                .transform((value) => {
                    if (value === "") {
                        return undefined; // Treat empty string as undefined
                    }
                    const parsedValue = Number(value);
                    if (isNaN(parsedValue)) {
                        throw new Error("Invalid number");
                    }
                    return parsedValue; // Convert to number
                });
        } else {

            schema = z.string()

            if (rules.min) {
                schema = schema.refine((value) => {
                    if (value) {
                        return rules.min && (value.length >= rules.min)
                    } else {
                        return true
                    }
                }, {
                    message: `${fieldName} must be at least ${rules.min} characters`
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
                    message: `${fieldName} must be at most ${rules.max} characters`
                })
            }
        }

        if (rules.required) {
            schema = schema.refine(
                (value) => value !== undefined && value !== "",
                { message: `Field is required` }
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
                message: `Invalid format for ${fieldName}`
            })
        }

    }
    return schema;
};

// Helper function to generate schema for object-based fields
const generateObjectSchema = (rules: Record<string, any>) => {
    const schemaObj: Record<string, z.ZodTypeAny> = {};

    Object.keys(rules).forEach((key) => {
        if (key !== "object") {
            schemaObj[key] = generateSchema(key, rules[key]);
        }
    });

    return schemaObj;
};


// Custom validator function
export const customValidator = (data: any, rules: validationRulesSchema) => {

    const schemaObj: Record<string, z.ZodTypeAny> = {};

    Object.keys(rules).forEach((key) => {
        schemaObj[key] = generateSchema(key, rules[key]);
    });
    const schema = z.object(schemaObj);

    try {
        schema.parse(data);

        return { isError: false, error: null };
    } catch (e) {
        if (e instanceof z.ZodError) {
            return {
                isError: true,
                error: e.errors.map((err) => {
                    return {
                        path: err.path.length > 1
                            ? err.path.length === 2
                                ? `${err.path[0]}.${err.path[1]}`
                                : ` ${err.path[0]}[${err.path[1]}].${err.path[2]}`
                            : err.path[0],
                        message: err.message,
                    }
                }),
            };
        }
        throw e;
    }
};

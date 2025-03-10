import { validationRulesSchema } from "../utils/validator";

export const supplierRules: validationRulesSchema = {
    clinic: { required: true },
    name: { required: true },
    phone: { required: true, pattern: /^[6-9]\d{9}$/ },
    email: { required: false, email: true },
    address: {
        object: true,
        city: { required: true },
        state: { required: true },
        country: { required: false },
        street: { required: false }
    }
} 
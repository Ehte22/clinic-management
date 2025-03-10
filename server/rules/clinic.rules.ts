import { validationRulesSchema } from "../utils/validator";

export const createClinicRules: validationRulesSchema = {
    name: { required: true },
    contactInfo: { required: true },
    startDate: { required: true },
    endDate: { required: true },
    alternateContactInfo: { required: false },
    email: { required: false },
    city: { required: true },
    state: { required: true },
    street: { required: true },
    country: { required: true },
    amount: { required: true, type: "number" },
    logo: { required: false },
    status: { required: false },
}
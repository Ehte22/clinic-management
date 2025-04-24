import { validationRulesSchema } from "../utils/validator";

export const medicineRules: validationRulesSchema = {
    clinic: { required: true },
    medicineName: { required: true, },
    mg: { required: true, },
    category: { required: true, },
    label: { required: false, },
    medicineType: { required: true, },
    price: { required: true, },
    stock: { required: true, },
    expiryDate: { required: true, },

}
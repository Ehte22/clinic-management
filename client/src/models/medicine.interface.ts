export interface IMedicine {
    _id?: string;
    medicineName: string;
    expiryDate: string;
    stock: number;
    mg: number;
    price: number;
    supplier: string;
    quantity: number;
    category: string;
    label: string;
    clinicId: string;
    medicineType: string;
}
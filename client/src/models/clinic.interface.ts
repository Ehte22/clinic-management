export interface IClinic {
    _id?: string;
    clinicAdmin?: string;
    name: string;
    city: string;
    state: string;
    street: string;
    country: string;
    contactInfo: number;
    amount: number;
    alternateContactInfo?: string;
    email?: string;
    startDate: string;
    endDate: string;
    subscription: number;
    logo?: string;
    registrationNumber?: number;
    status?: boolean;
    deletedAt?: Date | null
    id?: string
}
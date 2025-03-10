export interface ISupplier {
    _id?: string
    clinic?: string
    name: string;
    phone: string;
    email: string;
    address: {
        city: string;
        state: string;
        street: string;
        country: string;
    }
    deletedAt?: Date | null
}
import { openDB } from "idb"
import { toast } from "./utils/toast";

const dbPromise = openDB("clinic-management", 1, {
    upgrade(db) {
        const stores = [
            "appointments",
            "clinics",
            "doctors",
            "invoices",
            "medicines",
            "patients",
            "prescriptions",
            "receptionists",
            "sellmedicines",
            "suppliers",
            "users",
        ];

        stores.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "_id" });
            }
        });
    },
})

type StoreType = "appointments" | "clinics" | "doctors" | "invoices" | "medicines" | "patients" | "prescriptions" | "receptionists" | "sellmedicines" | "suppliers" | "users"

export const idbHelpers = {

    saveAll: async ({ storeName, data }: { storeName: StoreType, data: any }) => {
        const db = await dbPromise
        const tx = db.transaction(storeName, "readwrite")
        const store = tx.objectStore(storeName)

        await store.clear()

        await Promise.all(data.map((item: any) => store.put(item)))

        tx.done
    },

    get: async ({ storeName, _id }: { storeName: StoreType, _id: string }) => {
        const db = await dbPromise
        const tx = db.transaction(storeName, "readonly")
        const store = tx.objectStore(storeName)
        const data = await store.get(_id)

        return data
    },

    getAll: async ({ storeName }: { storeName: StoreType }) => {
        const db = await dbPromise
        const tx = db.transaction(storeName, "readonly")
        const store = tx.objectStore(storeName)
        const data = await store.getAll()

        let filteredData = data.filter(item => !item.isOfflineDeleted)

        return filteredData
    },

    add: async ({ storeName, endpoint, data, isFormData = false }: { storeName: StoreType, endpoint: string, data: any, isFormData?: boolean }) => {
        const db = await dbPromise
        const tx = db.transaction(storeName, "readwrite")
        const store = tx.objectStore(storeName)

        const newData = { ...data, _id: crypto.randomUUID(), isOfflineAdded: true, isFormData, endpoint }

        await store.add(newData)
        await tx.done

        toast.showInfo("Your changes will sync when you are online")
    },

    update: async ({ storeName, endpoint, _id, data, isFormData = false }: { storeName: StoreType, endpoint: string, _id: string, data: any, isFormData?: boolean }) => {
        const db = await dbPromise
        const tx = db.transaction(storeName, "readwrite")
        const store = tx.objectStore(storeName)

        const existingData = await store.get(_id)

        let updatedData
        if (existingData.isOfflineAdded) {
            updatedData = { ...existingData, ...data, endpoint: existingData.endpoint }
        } else {
            updatedData = { ...existingData, ...data, isOfflineUpdated: true, isFormData, endpoint }
        }

        await store.put(updatedData)
        await tx.done

        toast.showInfo("Your changes will sync when you are online")
    },

    delete: async ({ storeName, _id, endpoint }: { storeName: StoreType, _id: string, endpoint: string }) => {
        const db = await dbPromise
        const tx = db.transaction(storeName, "readwrite")
        const store = tx.objectStore(storeName)

        const data = await store.get(_id)

        const updatedData = { ...data, isOfflineDeleted: true, endpoint }

        if (data.isOfflineAdded) {
            await store.delete(_id)
        } else {
            await store.put(updatedData)
        }
        await tx.done

        toast.showInfo("Your changes will sync when you are online")
    },

    clear: async ({ storeName }: { storeName: StoreType }) => {
        const db = await dbPromise;
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        await store.clear();
        await tx.done;
    },

    sync: async () => {
        const db = await dbPromise;
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user?.token) {
            return;
        }

        const headers: HeadersInit = {
            "Authorization": `Bearer ${user.token}`
        };

        // Fetch all store data in parallel
        const storeNames = Array.from(db.objectStoreNames);
        const transactions = storeNames.map(async (storeName) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            return { storeName, data: await store.getAll() };
        });

        const allStoresData = await Promise.all(transactions);

        // Flatten all data across stores and filter only items that need syncing
        const itemsToSync = allStoresData.flatMap(({ storeName, data }) =>
            data
                .filter(item => item.isOfflineAdded || item.isOfflineUpdated || item.isOfflineDeleted)
                .map(item => ({ storeName, ...item }))
        );


        if (itemsToSync.length === 0) return;

        // Prepare sync requests
        const syncRequests = itemsToSync.map(async (item) => {
            try {
                const { storeName, _id, isFormData, isOfflineAdded, isOfflineUpdated, isOfflineDeleted, endpoint, ...data } = item;
                console.log(item);

                // 🚨 Ensure the endpoint is present before making the request
                if (!endpoint) {
                    console.error(`Skipping sync for ${storeName}: Missing endpoint`, item);
                    return;
                }

                // Remove null and "null" values
                const cleanedData = Object.fromEntries(
                    Object.entries(data).filter(([_, v]) => v !== null && v !== "null")
                );

                let payload: any = JSON.stringify(cleanedData);
                let method = "POST";
                let url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/${endpoint}`;

                if (isFormData) {
                    payload = objectToFormData(cleanedData);
                } else {
                    headers["Content-Type"] = "application/json";
                }

                if (isOfflineUpdated) {
                    method = "PUT";
                    url += `/${_id}`;
                } else if (isOfflineDeleted) {
                    method = "PUT";
                    url += `/${_id}`;
                }

                const response = await fetch(url, { method, headers, body: payload });

                if (!response.ok) {
                    throw new Error(`Failed to sync ${method} ${url} - Status: ${response.status}`);
                }

                // Remove successfully synced items from IndexedDB
                await idbHelpers.deleteFormIndexDb({ storeName, _id });
            } catch (error) {
                console.error(`Sync failed for ${item.storeName} -`, error);
            }
        });

        // Run all sync requests in parallel
        await Promise.allSettled(syncRequests);
    },


    // sync: async () => {
    //     const db = await dbPromise

    //     const user = JSON.parse(localStorage.getItem("user") || "")

    //     for (const storeName of db.objectStoreNames) {
    //         const tx = db.transaction(storeName, "readonly")
    //         const store = tx.objectStore(storeName)
    //         const allData = await store.getAll()

    //         if (allData.length > 0) {
    //             for (const item of allData) {
    //                 const { _id, ...data } = item
    //                 try {
    //                     const headers: HeadersInit = {
    //                         "Authorization": `Bearer ${user?.token}`
    //                     };

    //                     let payload: any = JSON.stringify(data)
    //                     if (data.isFormData) {
    //                         payload = objectToFormData(data);
    //                     } else {
    //                         headers["Content-Type"] = "application/json";
    //                     }

    //                     if (item.isOfflineAdded) {
    //                         await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/${item.endpoint}`, {
    //                             method: "POST",
    //                             headers: headers,
    //                             body: payload
    //                         })
    //                     } else if (item.isOfflineUpdated) {
    //                         await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/${item.endpoint}/${item._id}`, {
    //                             method: 'PUT',
    //                             headers: headers,
    //                             body: payload,
    //                         });
    //                     } else if (item.isOfflineDeleted) {
    //                         await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/${item.endpoint}/${item._id}`, {
    //                             method: 'PUT',
    //                             headers: {
    //                                 'Content-Type': 'application/json',
    //                                 'Authorization': `Bearer ${user?.token}`
    //                             },
    //                         });
    //                     }

    //                     await idbHelpers.deleteFormIndexDb({ storeName, _id: item._id })
    //                 } catch (error) {
    //                     console.log(`Sync failed for ${storeName}`, error);
    //                 }
    //             }
    //         }
    //     }
    // },

    deleteFormIndexDb: async ({ storeName, _id }: { storeName: string, _id: string }) => {
        const db = await dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        await store.delete(_id);
        await tx.done;
    }

}

const objectToFormData = (obj: any): FormData => {
    const formData = new FormData();

    Object.keys(obj).forEach(key => {

        if (obj[key] instanceof FileList) {
            Array.from(obj[key]).forEach((file) => {
                formData.append(key, file);
            });
        } else if (typeof obj[key] === "object" && Array.isArray(obj[key])) {
            obj[key].forEach((item, index) => {
                Object.keys(item).forEach((subKey) => {
                    formData.append(`${key}[${index}][${subKey}]`, item[subKey])
                })
            })
        } else {
            formData.append(key, obj[key]);
        }
    });

    // console.log("Final FormData Entries:");
    // for (const pair of formData.entries()) {
    //     console.log(pair[0], pair[1]);
    // }

    return formData;
};


// const base64ToBlob = (base64: string, mimeType: string) => {
//     const byteCharacters = atob(base64.split(",")[1]);
//     const byteArrays = [];

//     for (let i = 0; i < byteCharacters.length; i++) {
//         byteArrays.push(byteCharacters.charCodeAt(i));
//     }

//     return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
// };



import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { SetValueConfig } from 'react-hook-form';
import { GETDATA, Medicine } from '../../redux/apis/medicineApi';


type ModalProps = {
    setValue: (name: string, value: any, config?: Partial<SetValueConfig>) => void;
    medicineData?: GETDATA
    open?: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type AllergyTypeMap = {
    [key: string]: string[];
};


const Modal: React.FC<ModalProps> = ({ setValue, medicineData, open, setOpen }) => {

    const [medicines, setMedicines] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    const [selectedHallType, setSelectedHallType] = useState<string | null>(null);


    const [selectedAllergyTypes, setSelectedAllergyTypes] = useState<AllergyTypeMap>({});
    const [categories, setCategories] = useState<Record<string, string[]>>({})

    const handleClose = () => setOpen(false);

    const handleAddMedicine = () => {
        if (inputValue.trim() && !medicines.includes(inputValue.trim())) {
            setMedicines((prevMedicines) => [...prevMedicines, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleClickHallMedicine = (hallMedicine: any) => {



        setSelectedHallType(hallMedicine);
        if (!selectedAllergyTypes[hallMedicine]) {
            setSelectedAllergyTypes((prev) => ({ ...prev, [hallMedicine]: [] }));
        }
    };

    const handleCheckboxChange = (type: string) => {
        if (selectedHallType === null) {
            return;
        }

        setSelectedAllergyTypes((prev) => {
            const updatedTypes = prev[selectedHallType] || [];
            const isSelected = updatedTypes.includes(type);
            return {
                ...prev,
                [selectedHallType]: isSelected
                    ? updatedTypes.filter((t) => t !== type)
                    : [...updatedTypes, type],
            };
        });
    };
    const handleRemoveMedicine = (medicine: any) => {
        setMedicines((prevMedicines) =>
            prevMedicines.filter((item) => item !== medicine)
        );
    };




    const handleSelectedMedicine = (medicines: any) => {

        const allMedicines = Object.values(medicines).flat();

        const x = allMedicines.map(item => {

            return { medicine: item, }
        })

        setValue("medical", x)
        setOpen(false)

    }




    const filteredMedicines = medicines.filter((medicine) =>
        medicine.toLowerCase().includes(inputValue.toLowerCase())
    );

    const hallTypes = {
        'Pollen Allergy': ['Hall1', 'Hall2', 'Hall3'],
        'Dust Mite': ['Strips1', 'Strips2'],
        'Pet Allergy': ['Hall5', 'Hall6'],
        'Food Allergy': ['Hall7', 'Hall8'],
        'Mold Allergy': ['Hall9', 'Hall10'],
        'Insect Sting Allergy': ['Hall11', 'Hall12'],
        'Latex Allergy': ['Hall13', 'Hall14'],
        'Seasonal Allergic Rhinitis': ['Hall15', 'Hall16'],
        'Skin Allergy': ['Hall17', 'Hall18'],
        'Wheat Allergy': ['Hall19', 'Hall20'],
        'Seafood Allergy': ['Hall21', 'Hall22'],
        'Nickel Allergy': ['Hall23', 'Hall24'],
    };



    useEffect(() => {
        if (medicineData) {
            const updatedCategories: Record<string, string[]> = {};

            medicineData.result.forEach((item: Medicine) => {
                if (!updatedCategories[item.category as string]) {
                    updatedCategories[item.category as string] = [];
                }

                if (!updatedCategories[item.category as string].includes(item.medicineName)) {
                    updatedCategories[item.category as string].push(item.medicineName);
                }
            });

            setCategories(updatedCategories);

            Object.keys(updatedCategories).forEach(key => {
                if (!medicines.includes(key)) {
                    medicines.push(key)
                }
            })

        }
    }, [medicineData]);

    return (
        <div>

            <Dialog open={open} onClose={handleClose} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                        >
                            <div className="sm:flex sm:items-start">
                                <div className="mb-4 flex justify-between items-center w-full">
                                    <input
                                        type="text"
                                        placeholder="Search Medicine..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="p-2 border border-gray-800 rounded-md w-full"
                                    />
                                    <button
                                        onClick={handleAddMedicine}
                                        className="ml-2 rounded-md bg-green-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-green-500"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {filteredMedicines.map((medicine, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 cursor-pointer"
                                            onClick={() => handleClickHallMedicine(medicine)}
                                        >
                                            {medicine}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveMedicine(medicine);
                                                }}
                                                className="ml-2 text-red-600"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}

                                </div>
                            </div>

                            <hr />

                            {selectedHallType && categories[selectedHallType as keyof typeof hallTypes] && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-lg">
                                        Select types for {selectedHallType}
                                    </h4>
                                    <div className="mt-2">
                                        {categories[selectedHallType as keyof typeof hallTypes].map((type, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={type}
                                                    checked={
                                                        selectedAllergyTypes[selectedHallType]?.includes(type) || false
                                                    }
                                                    onChange={() => handleCheckboxChange(type)}
                                                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                                />
                                                <label htmlFor={type} className="text-sm text-gray-800">
                                                    {type}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <hr />
                            <div className="mt-4">
                                <h4 className="font-semibold text-lg">Selected Allergies</h4>
                                <div className="mt-2">
                                    {Object.entries(selectedAllergyTypes).map(
                                        ([allergy, types]) =>
                                            types.length > 0 && (

                                                <div key={allergy} className="mb-2">
                                                    <h5 className="text-md font-medium">{allergy}</h5>
                                                    <ul className="ml-4 list-disc">
                                                        {types.map((type: any, index: any) => (
                                                            <li key={index} className="text-sm">
                                                                {type}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => handleSelectedMedicine(selectedAllergyTypes)}
                                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                                >
                                    Add Medicine
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div >
            </Dialog >
        </div >
    );
};

export default Modal;


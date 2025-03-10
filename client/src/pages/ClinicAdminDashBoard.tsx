import { useEffect, useState } from 'react';
import { useGetClinicAdminDashboardDataQuery } from '../redux/apis/dashboard.api';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid';
import Loader from '../components/Loader';
import ClinicSelector from '../components/ClinicSelector';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const ClinicAdminDashBoard = () => {

    const [incomeData, setIncomeData] = useState<any>([]);
    const [patientData, setPatientData] = useState<any>([]);
    const [selectedClinicId, setSelectedClinicId] = useState<string>("");

    const { user } = useSelector<RootState, any>(state => state.auth)

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const years = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => 2021 + i).reverse();

    const [selectYear, setSelectYear] = useState(years[0])

    const { data: allDashBoardData, isLoading } = useGetClinicAdminDashboardDataQuery({ selectedYear: selectYear, selectedClinicId });

    useEffect(() => {
        if (allDashBoardData) {
            if (allDashBoardData.patients) {
                setPatientData(allDashBoardData.patients);
            }

            if (allDashBoardData.income) {
                setIncomeData(allDashBoardData.income)
            }
        }
    }, [allDashBoardData, patientData, incomeData]);

    const patientOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Patient',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 11
                    },
                    stepSize: 10
                },
            }
        }
    };

    const incomeOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Income',
                font: {
                    size: 16
                }
            },
        },
    };

    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const patients = {
        labels,
        datasets: [
            {
                label: 'Old Patients',
                data: patientData.map((item: any) => item.oldPatients),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'New Patients',
                data: patientData.map((item: any) => item.newPatients),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const income = {
        labels,
        datasets: [
            {
                label: 'Total Income',
                data: incomeData.map((item: any) => item.totalAmount),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }

    return <>
        <div className='flex justify-end items-center gap-5'>
            {user && user.role === "Super Admin" && <ClinicSelector setSelected={setSelectedClinicId} isDashboard={true} />}

            <Listbox value={selectYear} onChange={setSelectYear}>
                <div className="relative  flex justify-end">
                    <ListboxButton className="grid w-40 cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                        <span className="col-start-1 row-start-1 truncate pr-6">{selectYear}</span>
                        <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </ListboxButton>

                    <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-60 w-40 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                    >
                        {years.map((year) => (
                            <ListboxOption
                                key={year}
                                value={year}
                                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                            >
                                <span className="block truncate font-normal group-data-[selected]:font-semibold">{year}</span>

                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                    <CheckIcon aria-hidden="true" className="size-5" />
                                </span>
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

        </div>

        <div className='h-64 sm:h-96 xl:h-[500px] border p-2 md:p-4 xl:p-8 mt-8' >
            <Bar options={incomeOptions} data={income} />
        </div>

        <div className='h-64 sm:h-96 xl:h-[500px] border p-2 md:p-4 xl:p-8 mt-8' >
            <Bar options={patientOptions} data={patients} />
        </div>

    </>
};

export default ClinicAdminDashBoard;

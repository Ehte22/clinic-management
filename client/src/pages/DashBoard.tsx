import { useEffect, useState } from "react"
import Loader from "../components/Loader"
import { IClinicRevenue, IIncome, IMonthlyTrends, useGetDashBoardDataQuery } from "../redux/apis/dashboard.api"
import { Chart as ChartJS, LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";

import { Bar, Line, Pie } from "react-chartjs-2"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/16/solid";

ChartJS.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const DashBoard = () => {

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const years = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => 2021 + i).reverse();

    const [selectYear, setSelectYear] = useState(years[0])

    const { data, isLoading } = useGetDashBoardDataQuery({ selectedYear: selectYear })
    const [clinicData, setClinicData] = useState<{ total: number, active: number, inactive: number }>()
    const [userData, setUserData] = useState<{ total: number, active: number, inactive: number }>()
    const [clinicRevenueData, setClinicRevenueData] = useState<IClinicRevenue>()
    const [monthlyTrendChart, setMonthlyTrendChart] = useState<IMonthlyTrends[]>()
    const [income, setIncome] = useState<IIncome[]>()
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Clinic Status Data
    const clinicChartData = {
        labels: ["Active Clinics", "Inactive Clinics"],
        datasets: [
            {
                label: "Clinics",
                data: [clinicData?.active, clinicData?.inactive],
                backgroundColor: ["#4BC0C0", "#FF6384"],
                hoverBackgroundColor: ["#22CFCF", "#FF4069"],
            },
        ],
    };

    // Clinic Status Options
    const clinicChartOptions: any = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Clinic Status Overview",
            },
        },
    }

    // User Status Data
    const userChartData = {
        labels: ["Active Users", "Inactive Users"],
        datasets: [
            {
                label: "Users",
                data: [userData?.active, userData?.inactive],
                backgroundColor: ["#36A2EB", "#FF9F40"],
                hoverBackgroundColor: ["#36A2EB", "#FF9020"],
            },
        ],
    };

    // User Status Options
    const userChartOptions: any = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "User Status Overview",
            },
        },
    }

    // Total Revenue Per Clinic
    const clinicRevenue = {
        labels: clinicRevenueData?.revenuePerClinic.map(item => item.name),
        datasets: [
            {
                label: "Total Revenue",
                data: clinicRevenueData?.revenuePerClinic.map(item => item.revenue),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                barThickness: 50,
                maxBarThickness: 80,
            },
        ],
    }

    // Total Revenue Per Options
    const revenueChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Total Revenue Per Clinic",
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },

            },
            y: {
                beginAtZero: true,
            }
        },

    };

    // Color generator
    const generateColor = (index: number) => {
        const colors = [
            "#4BC0C0", "#FF6384", "#FF9F40", "#36A2EB", "#A133FF", "#33FFF6", "#FF8C33", "#FF3333"
        ];
        return colors[index % colors.length];
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const clinics = [...new Set(monthlyTrendChart?.map(item => item.clinic))];

    const datasets = clinics.map((clinic, index) => {
        const color = generateColor(index);
        return {
            label: clinic,
            data: months.map(month => {
                const found = monthlyTrendChart?.find(item => item.clinic === clinic && +item.month === month);
                return found ? found.totalRevenue : 0;
            }),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2
            // tension: 0.8,
        };
    });

    // Monthly Trend Data
    const monthlyTrendsData = {
        labels,
        datasets: datasets
    };

    // Monthly Trend Options
    const monthlyTrendOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: "Monthly Revenue Trends Per Clinic"
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },

            },
            y: {
                beginAtZero: true,
            }
        },

    };

    // Income Data
    const incomeData = {
        labels,
        datasets: [
            {
                label: 'Total Income',
                data: income?.map((item: any) => item.totalAmount),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                barThickness: 50,
                maxBarThickness: 80,
            },
        ],
    };

    // Income Data Options
    const incomeOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Income",
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },

            },
            y: {
                beginAtZero: true,
            }
        },
    };

    useEffect(() => {
        if (data?.clinics) {
            setClinicData(data.clinics)
        }

        if (data?.users) {
            setUserData(data.users)
        }

        if (data?.revenue) {
            setClinicRevenueData(data.revenue)

        }
        if (data?.monthlyTrends) {
            setMonthlyTrendChart(data.monthlyTrends)
        }

        if (data?.income) {
            setIncome(data.income)
        }

    }, [data])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }

    return <>
        <div>

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


            <div className="mt-5 w-full h-[400px] flex justify-center items-center border border-1 pt-10 p-5">
                <Bar data={incomeData} options={incomeOptions} />
            </div>

            <div className="mt-5 w-full h-[400px] flex justify-center items-center border border-1 pt-10 p-5">
                <Bar data={clinicRevenue} options={revenueChartOptions} />
            </div>

            <div className="w-full h-[400px] flex justify-center items-center border border-1 pt-10 p-5 mt-5">
                <Line data={monthlyTrendsData} options={monthlyTrendOptions} />
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                <div className="border border-1 py-5" >
                    <Pie data={clinicChartData} options={clinicChartOptions} />
                </div>
                <div className="border border-1 py-5" >
                    <Pie data={userChartData} options={userChartOptions} />
                </div>
            </div>

        </div>
    </>
}

export default DashBoard
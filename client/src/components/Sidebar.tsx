import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { IUser } from '../models/user.interface'

type Role = "superAdmin" | "clinicAdmin" | "doctor" | "receptionist"

const roleBasedNavigation: Record<Role, Array<{
    name: string;
    href: string;
    icon: React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
            title?: string;
            titleId?: string;
        } & React.RefAttributes<SVGSVGElement>
    >;
    count?: string;
    current: boolean;
}>> = {
    superAdmin: [
        { name: 'Dashboard', href: '/dashboard', icon: PlusCircleIcon, current: false },
        { name: 'Clinic Dashboards', href: '/', icon: PlusCircleIcon, current: false },
        { name: 'Clinics', href: '/clinics', icon: PlusCircleIcon, current: false },
        { name: 'Users', href: '/users', icon: PlusCircleIcon, current: false },
        { name: 'Medicines', href: '/all-medicines', icon: PlusCircleIcon, current: false },
        { name: 'Invoices', href: '/invoice', icon: PlusCircleIcon, current: false },
        { name: 'Receptionist', href: '/receptionist', icon: PlusCircleIcon, current: false },
        { name: 'Doctors', href: '/doctor', icon: PlusCircleIcon, current: false },
        { name: 'Appointment', href: '/appointment', icon: PlusCircleIcon, current: false },
        { name: 'Prescription', href: '/prescription', icon: PlusCircleIcon, current: false },
        { name: 'Patient', href: '/patients', icon: PlusCircleIcon, current: false },
        { name: 'Supplier', href: '/suppliers', icon: PlusCircleIcon, current: false },
        { name: 'Buy Medicine', href: '/buy-med', icon: PlusCircleIcon, current: false },
    ],
    clinicAdmin: [
        { name: 'Dashboard', href: '/', icon: PlusCircleIcon, current: false },
        { name: 'Medicines', href: '/all-medicines', icon: PlusCircleIcon, current: false },
        { name: 'Invoices', href: '/invoice', icon: PlusCircleIcon, current: false },
        { name: 'Receptionist', href: '/receptionist', icon: PlusCircleIcon, current: false },
        { name: 'Doctors', href: '/doctor', icon: PlusCircleIcon, current: false },
        { name: 'Appointment', href: '/appointment', icon: PlusCircleIcon, current: false },
        { name: 'Prescription', href: '/prescription', icon: PlusCircleIcon, current: false },
        { name: 'Patient', href: '/patients', icon: PlusCircleIcon, current: false },
        { name: 'Supplier', href: '/suppliers', icon: PlusCircleIcon, current: false },
        { name: 'Buy Medicine', href: '/buy-med', icon: PlusCircleIcon, current: false },
    ],
    doctor: [
        { name: 'Medicines', href: '/all-medicines', icon: PlusCircleIcon, current: false },
        { name: 'Invoices', href: '/invoice', icon: PlusCircleIcon, current: false },
        { name: 'Receptionist', href: '/receptionist', icon: PlusCircleIcon, current: false },
        { name: 'Appointment', href: '/appointment', icon: PlusCircleIcon, current: false },
        { name: 'Prescription', href: '/prescription', icon: PlusCircleIcon, current: false },
        { name: 'Patient', href: '/patients', icon: PlusCircleIcon, current: false },
        { name: 'Supplier', href: '/suppliers', icon: PlusCircleIcon, current: false },
        { name: 'Buy Medicine', href: '/buy-med', icon: PlusCircleIcon, current: false },
    ],
    receptionist: [
        { name: 'Medicines', href: '/all-medicines', icon: PlusCircleIcon, current: false },
        { name: 'Invoices', href: '/invoice', icon: PlusCircleIcon, current: false },
        { name: 'Appointment', href: '/appointment', icon: PlusCircleIcon, current: false },
        { name: 'Patient', href: '/patients', icon: PlusCircleIcon, current: false },
        { name: 'Supplier', href: '/suppliers', icon: PlusCircleIcon, current: false },
        { name: 'Buy Medicine', href: '/buy-med', icon: PlusCircleIcon, current: false },
    ],
}

interface SideBarCompo {
    toggleSidebar: () => void
    userData?: IUser
}

const Sidebar: React.FC<SideBarCompo> = ({ toggleSidebar, userData }) => {

    const x = localStorage.getItem("user")

    let user
    if (x) {
        user = JSON.parse(x)
    }

    const tabView = window.innerWidth < 1024

    const handleToggleSideBar = () => {
        if (tabView) {
            toggleSidebar()
        }
    }

    let navigation: any[] = []
    if (user?.role === "Super Admin") {
        navigation = roleBasedNavigation["superAdmin"]
    } else if (user?.role === "Clinic Admin") {
        navigation = roleBasedNavigation["clinicAdmin"]
    } else if (user?.role === "Doctor") {
        navigation = roleBasedNavigation["doctor"]
    } else if (user?.role === "Receptionist") {
        navigation = roleBasedNavigation["receptionist"]
    }

    return <>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 w-80 h-screen fixed scrollbar-hide">
            <div className="flex h-16 shrink-0 items-center">
                <span className='text-white'>LOGO</span>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1" >
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        onClick={handleToggleSideBar}
                                        className='text-gray-400 hover:bg-gray-800 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold'

                                    >
                                        <item.icon aria-hidden="true" className="size-6 shrink-0" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li className="-mx-6 mt-auto">
                        <Link
                            to={`/profile/${userData?._id}`}
                            className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white hover:bg-gray-800"
                        >
                            <img
                                alt={userData?.firstName}
                                src={userData?.profile ? userData.profile : "/profile.png"}
                                className="size-8 rounded-full bg-gray-800"
                            />
                            <span className="sr-only">{userData?.firstName} {userData?.lastName}</span>
                            <span aria-hidden="true">{userData?.firstName} {userData?.lastName}</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    </>
}

export default Sidebar


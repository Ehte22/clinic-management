import { Disclosure, DisclosureButton, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline'
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignOutMutation } from '../redux/apis/auth.api'
import { toast } from '../utils/toast'
import { IUser } from '../models/user.interface'

const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
    { name: 'Sign out', href: '#', },
]

interface NavbarCompo {
    toggleSidebar: () => void
    userData?: IUser
}

const Navbar: React.FC<NavbarCompo> = ({ toggleSidebar, userData }) => {
    const navigate = useNavigate()

    const [signOut, { data: message, error, isSuccess, isError }] = useSignOutMutation()

    const handleSignOut = async () => {
        if (userData) {
            signOut()
        }
    }

    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess(message)
            navigate("/login")
        }

        if (isError) {
            toast.showError(error as string)
        }

    }, [message, error, isSuccess, isError])

    return <>
        <Disclosure as="nav" className="bg-gray-800 fixed w-full z-40 mb-16">
            <div className="mx-auto px-4 sm:px-6 lg:px-10">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="-ml-2 mr-2 flex items-center lg:hidden">
                            {/* Mobile menu button */}
                            <DisclosureButton onClick={toggleSidebar} className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                <Bars3Icon className="block size-6" />
                            </DisclosureButton>
                        </div>
                        <div className="flex h-16 shrink-0 items-center">
                            <span className='text-white'>LOGO</span>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:ml-4 md:flex md:shrink-0 md:items-center">
                            <button
                                type="button"
                                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">View notifications</span>
                                <BellIcon aria-hidden="true" className="size-6" />
                            </button>

                            {/* Profile dropdown */}
                            <Menu as="div" className="relative ml-3">
                                <div>
                                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">Open user menu</span>
                                        <img alt="profile image" src={userData?.profile ? userData.profile : "/profile.png"} className="size-8 rounded-full" />
                                    </MenuButton>
                                </div>
                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                >
                                    {userNavigation.map((item) => (
                                        <MenuItem key={item.name} >
                                            {item.name === "Sign out" ? (
                                                <button
                                                    onClick={handleSignOut}
                                                    className="block w-full px-4 py-2 text-sm text-gray-700 text-left"
                                                >
                                                    {item.name}
                                                </button>
                                            ) : (
                                                <Link
                                                    to={`/profile/${userData?._id}`}
                                                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                                                >
                                                    {item.name}
                                                </Link>
                                            )}
                                        </MenuItem>
                                    ))}
                                </MenuItems>
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>

        </Disclosure>
    </>
}

export default Navbar

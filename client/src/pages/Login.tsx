import { useEffect } from "react"
import useDynamicForm from "../components/useDynamicForm"
import { FieldConfig } from "../models/fieldConfig.interface"
import { useSignInMutation } from "../redux/apis/auth.api"
import { customValidator } from "../utils/validator"
import { toast } from "../utils/toast"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"

const fields: FieldConfig[] = [
    {
        name: "email",
        label: "Email Address",
        type: "text",
        placeholder: "Enter Your Email",
        rules: { required: true, email: true }
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter Your Password",
        rules: { required: true }
    },
]

const defaultValues = {
    email: "",
    password: ""
}

const Login = () => {
    const [signIn, { data, error, isSuccess, isError }] = useSignInMutation()

    const navigate = useNavigate()
    const { user } = useSelector<RootState, any>(state => state.auth)

    const schema = customValidator(fields)

    const onSubmit = (data: any) => {
        signIn(data)
    }

    const { renderSingleInput, handleSubmit } = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess(data.message)
            if (user) {
                if (user.role === "Super Admin") {
                    navigate("/dashboard")
                } else if (user.role === "Clinic Admin") {
                    navigate("/")
                } else if (user.role === "Doctor") {
                    navigate("/appointment")
                } else if (user.role === "Receptionist") {
                    navigate("/patients")
                }
            }
        }

        if (isError) {
            toast.showError(error as string)
        }

    }, [data, error, isSuccess, isError])

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img
                    alt="Your Company"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">

                        {/* Email Address */}
                        <div>
                            {renderSingleInput("email")}
                        </div>

                        {/* Password */}
                        <div>
                            {renderSingleInput("password")}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-3">
                                <div className="flex h-6 shrink-0 items-center">
                                    <div className="group grid size-4 grid-cols-1">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                        />
                                        <svg
                                            fill="none"
                                            viewBox="0 0 14 14"
                                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                                        >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:checked]:opacity-100"
                                            />
                                            <path
                                                d="M3 7H11"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <label htmlFor="remember-me" className="block text-sm/6 text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm/6">
                                <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                </div>

            </div>
        </div>
    </>

}


export default Login
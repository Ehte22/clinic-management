import { useEffect } from "react"
import useDynamicForm from "../components/useDynamicForm"
import { FieldConfig } from "../models/fieldConfig.interface"
import { customValidator } from "../utils/validator"
import { toast } from "../utils/toast"
import { useForgotPasswordMutation } from "../redux/apis/auth.api"
import { Link } from "react-router-dom"
import { z } from "zod"
import Loader from "../components/Loader"

const fields: FieldConfig[] = [
    {
        name: "email",
        label: "Email Address",
        type: "text",
        placeholder: "Enter Your Email",
        rules: { required: true, email: true }
    },
]

const defaultValues = {
    email: "",
}

const ForgotPassword = () => {
    const [forgotPassword, { data: message, isLoading, error, isSuccess, isError }] = useForgotPasswordMutation()

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (data: FormValues) => {
        forgotPassword(data.email)
    }

    const { renderSingleInput, handleSubmit } = useDynamicForm({ schema, fields: fields, onSubmit, defaultValues })

    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess(message)
        }

        if (isError) {
            toast.showError(error as string)
        }
    }, [message, error, isSuccess, isError])

    return <>
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 px-6 lg:px-8">

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <h2 className="text-center text-xl md:text-2xl/9 font-bold mb-5 tracking-tight text-gray-900">
                        Forgot Password?
                    </h2>
                    <p className="text-center text-gray-500 text-sm my-8">
                        Enter your email address below, and we’ll send you a password reset link. Follow the instructions in the email to reset your password securely.</p>
                    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">

                        {/* Email Address */}
                        <div>
                            {renderSingleInput("email")}
                        </div>

                        <div>
                            {
                                isLoading
                                    ? <Loader />
                                    : <button
                                        type="submit"
                                        className="flex mt-7 w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Send
                                    </button>
                            }
                        </div>

                        <div className="text-sm/6 text-center">
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Back to Login
                            </Link>
                        </div>

                    </form>

                </div>

            </div >
        </div >
    </>

}


export default ForgotPassword


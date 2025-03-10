import { useEffect, useState } from "react"
import useDynamicForm from "../components/useDynamicForm"
import { FieldConfig } from "../models/fieldConfig.interface"
import { customValidator } from "../utils/validator"
import { useResetPasswordMutation } from "../redux/apis/auth.api"
import { toast } from "../utils/toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"

const fields: FieldConfig[] = [
    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter New Password",
        rules: { required: true, min: 8 }
    },
    {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        placeholder: "Confirm Your Password",
        rules: { required: true }
    },
]

const defaultValues = {
    password: "",
    confirmPassword: ""
}

const ResetPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const [isMatchError, setIsMatchError] = useState(false)

    const [resetPassword, { data: message, error, isSuccess, isError }] = useResetPasswordMutation()

    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    const onSubmit = (data: FormValues) => {
        const password = getValues("password")
        const confirmPassword = getValues("confirmPassword")

        if (password !== confirmPassword) {
            setIsMatchError(true)
            return;
        }

        setIsMatchError(false)

        if (token) {
            resetPassword({ password: data.password, confirmPassword: data.confirmPassword, token })
        }
    }

    const { renderSingleInput, handleSubmit, getValues } = useDynamicForm({ schema, fields, onSubmit, defaultValues })

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
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 px-6 lg:px-8">

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <h2 className="text-center text-xl md:text-2xl/9 font-bold mb-5 tracking-tight text-gray-900">
                        Create a New Password
                    </h2>
                    <p className="text-center text-gray-500 text-sm my-8">
                        Your password must be at least 8 characters long and match the confirmation.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
                        {/* Password */}
                        <div>
                            {renderSingleInput("password")}
                        </div>

                        {/*Confirm Password */}
                        <div>
                            <div className="mb-0 my-0">
                                {renderSingleInput("confirmPassword")}
                            </div>
                            {isMatchError && <p className=" text-sm text-red-600" style={{ marginTop: "-10xp" }}>Password do not match</p>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex mt-7 w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Reset Password
                            </button>
                        </div>

                    </form>

                </div>

            </div >
        </div >
    </>

}


export default ResetPassword


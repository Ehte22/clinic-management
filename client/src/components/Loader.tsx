import React from "react"

const Loader: React.FC<{ size?: number }> = ({ size = 6 }) => {

    return <>
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-indigo-600`}></div>
        </div>
    </>
}

export default Loader
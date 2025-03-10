import React from "react"

const Loader: React.FC<{ size?: number }> = ({ size = 6 }) => {

    return <>
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full  border-t-2 border-b-2 border-indigo-600`}
                style={{ height: `${size * 4}px`, width: `${size * 4}px` }}></div>
        </div>
    </>
}

export default Loader
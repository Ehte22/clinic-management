
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../redux/store'
import { ReactNode } from 'react';

const Protected = ({ roles, compo }: { roles: string[], compo: ReactNode }) => {

    const { user } = useSelector<RootState, any>(state => state.auth)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return roles.includes(user.role) ? <>{compo}</> : <Navigate to="/unauthorized" replace />;

}

export default Protected
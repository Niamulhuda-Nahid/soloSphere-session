import React, { useContext } from 'react';
import { AuthContext } from '../provider/Authprovider';
import { Navigate, replace, useLocation } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const {user , loading} = useContext(AuthContext);
    const location = useLocation();

    if(loading) return <p>Loadding...</p>

    if(user) return children;

    return <Navigate to='/login' state={location.pathname} replace></Navigate>
};

export default PrivateRoute;
import React from 'react';

import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({children,allowedRoles}){
    const token = useSelector((state)=>state.auth.token);
    const user = useSelector((state) => state.auth._current_user || {});

    if (!token) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/notfound" />
    }
   // return token ? children : <Navigate to="/login" />;
   return children;
}
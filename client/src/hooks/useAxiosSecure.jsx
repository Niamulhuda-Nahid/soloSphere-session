import axios from 'axios';
import React, { useEffect } from 'react';
import useAuth from './useAuth';
import { useNavigate } from 'react-router-dom';

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

const useAxiosSecure = () => {
    const { logOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axiosSecure.interceptors.response.use(
            res => {
                // console.log('intercept in use response', res)
                return res
            },
            async err => {
                if (err.response.status === 401 || err.response.status === 403) {
                    await logOut();
                    navigate('/login')
                }
                return Promise.reject(err)
            }
        );
         // Cleanup interceptor when the component unmounts
         return () => {
            axiosSecure.interceptors.response.eject(interceptor);
        };
    }, [logOut, navigate])



    return axiosSecure;
};

export default useAxiosSecure;
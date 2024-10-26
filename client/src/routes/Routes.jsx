import { createBrowserRouter } from "react-router-dom";
import Main from "../layouts/Main";
import Home from "../pages/Home";
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import JobDetails from "../pages/JobDetails";
import AddJob from "../pages/AddJob";
import ErrorPage from "../pages/ErrorPage";
import MyPostedJobs from "../pages/MyPostedJobs";
import UpdateJob from "../pages/UpdateJob";
import PrivateRoute from "./PrivateRoute";
import MyBid from "../pages/MyBid";
import BidRequest from "../pages/BidRequest";
import AllJobs from "../pages/AllJobs";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Main></Main>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
            {
                index: true,
                element: <Home></Home>
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            },
            {
                path: '/job/:id',
                element: <PrivateRoute><JobDetails /></PrivateRoute>,
                loader: ({ params }) => fetch(`${import.meta.env.VITE_API_URL}/job/${params.id}`)
            },
            {
                path: 'add-job',
                element: <PrivateRoute><AddJob></AddJob></PrivateRoute>
            },
            {
                path: 'my-posted-jobs',
                element: <PrivateRoute><MyPostedJobs/></PrivateRoute>
            },
            {
                path: 'update-job/:id',
                element: <PrivateRoute><UpdateJob/></PrivateRoute>,
                loader: ({ params }) => fetch(`${import.meta.env.VITE_API_URL}/job/${params.id}`)
            },
            {
                path: '/my-bids',
                element: <PrivateRoute><MyBid></MyBid></PrivateRoute>
            },
            {
                path: '/bid-request',
                element: <PrivateRoute><BidRequest></BidRequest></PrivateRoute>
            },
            {
                path: '/all-jobs',
                element: <AllJobs></AllJobs>
            }
        ]
    }
]);

export default router;
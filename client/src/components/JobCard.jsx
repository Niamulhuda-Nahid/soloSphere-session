import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({job}) => {
    const { _id, job_title, deadline, description,min_price, max_price, category, bid_count} = job || {};
    return (
        <Link to={`/job/${_id}`} className='w-full max-w-sm px-4 py-3 bg-white rounded-md shadow-md hover:scale-[1.05] transition-all'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-light text-gray-800 '>
                    Deadline: {new Date(deadline).toLocaleDateString()}
                </span>
                <span className={`px-3 py-1 text-[8px] uppercase rounded-full
                    ${job?.category === 'Web Development' && ' text-blue-500 bg-blue-100/60'}
                    ${job?.category === "Graphics Design" && 'text-green-500 bg-green-100/60'}
                    ${job?.category === "Digital Marketing" && 'text-pink-500 bg-pink-100/60' } `}>
                    {category}
                </span>
            </div>

            <div>
                <h1 className='mt-2 text-lg font-semibold text-gray-800 '>
                   {job_title}
                </h1>

                <p title={description} className='mt-2 text-sm text-gray-600 '>
                    {description.substring(0,30)}...
                </p>
                <p className='mt-2 text-sm font-bold text-gray-600 '>
                    Range: ${min_price} - ${max_price}
                </p>
                <p className='mt-2 text-sm font-bold text-gray-600 '>
                    Bid Count: {bid_count}
                </p>
            </div>
        </Link>
    );
};

export default JobCard;
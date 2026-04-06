import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    console.log(`Job ${job.id} ${!isSaved ? 'saved' : 'unsaved'}`);
  };

  // Format salary range
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (min && !max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  // Get job type color
  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': 'bg-green-100 text-green-800',
      'Part-time': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-orange-100 text-orange-800',
      'Remote': 'bg-purple-100 text-purple-800',
      'Internship': 'bg-yellow-100 text-yellow-800',
      'Freelance': 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border border-transparent hover:border-blue-200"
    >
      {/* Featured Badge */}
      {job.is_featured && (
        <div className="flex justify-end mb-2">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
            ⭐ Featured
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {job.company_logo ? (
            <img
              src={job.company_logo}
              alt={job.company_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {job.company_name?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{job.company_name}</p>
            </div>
            
            {/* Save Icon */}
            <button
              onClick={handleSaveClick}
              className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill={isSaved ? 'red' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Location */}
          <div className="mt-3 flex items-center text-gray-500 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{job.location || 'Location not specified'}</span>
          </div>

          {/* Salary */}
          <div className="mt-1 flex items-center text-gray-500 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
          </div>

          {/* Job Type Tag */}
          <div className="mt-3">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getJobTypeColor(job.job_type)}`}>
              {job.job_type || 'Full-time'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
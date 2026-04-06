import JobCard from './JobCard';

const JobListing = () => {
  // Sample test data
  const testJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company_name: "Google",
      company_logo: null,
      location: "Mountain View, CA",
      salary_min: 120000,
      salary_max: 180000,
      job_type: "Full-time",
      is_featured: true
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company_name: "Apple",
      company_logo: null,
      location: "Cupertino, CA",
      salary_min: 90000,
      salary_max: 130000,
      job_type: "Full-time",
      is_featured: false
    },
    {
      id: 3,
      title: "Remote React Developer",
      company_name: "Microsoft",
      company_logo: null,
      location: "Remote",
      salary_min: 100000,
      salary_max: 150000,
      job_type: "Remote",
      is_featured: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobListing;
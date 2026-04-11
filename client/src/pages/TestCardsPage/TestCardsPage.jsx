import React from 'react';
import JobCard from '../../components/jobs/JobCard/JobCard';
import CompanyCard from '../../components/companies/CompanyCard/CompanyCard';
import './TestCardsPage.css';

const sampleJobs = [
    {
        id: 1,
        title: "Senior Full Stack Developer",
        company: "TechCorp Solutions",
        company_initials: "TC",
        location: "San Francisco, CA",
        salary_min: 120000,
        salary_max: 180000,
        job_type: "full-time",
        is_featured: true
    },
    {
        id: 2,
        title: "Frontend Developer",
        company: "DesignStudio",
        company_initials: "DS",
        location: "Remote",
        salary_min: 80000,
        salary_max: 110000,
        job_type: "remote",
        is_featured: false
    },
    {
        id: 3,
        title: "UI/UX Designer",
        company: "CreativeAgency",
        company_initials: "CA",
        location: "New York, NY",
        salary_min: 70000,
        salary_max: 95000,
        job_type: "contract",
        is_featured: true
    },
    {
        id: 4,
        title: "DevOps Engineer",
        company: "CloudTech",
        company_initials: "CT",
        location: "Austin, TX",
        salary_min: 130000,
        salary_max: 170000,
        job_type: "full-time",
        is_featured: false
    },
    {
        id: 5,
        title: "Product Manager",
        company: "InnovateLabs",
        company_initials: "IL",
        location: "Seattle, WA",
        salary_min: 110000,
        salary_max: 160000,
        job_type: "full-time",
        is_featured: true
    },
    {
        id: 6,
        title: "Data Scientist",
        company: "DataWorks",
        company_initials: "DW",
        location: "Boston, MA",
        salary_min: 100000,
        salary_max: 150000,
        job_type: "full-time",
        is_featured: false
    }
];

const sampleCompanies = [
    {
        id: 1,
        name: "TechCorp Solutions",
        initials: "TC",
        location: "San Francisco, CA",
        jobs_count: 12,
        is_verified: true
    },
    {
        id: 2,
        name: "DesignStudio",
        initials: "DS",
        location: "Remote",
        jobs_count: 5,
        is_verified: true
    },
    {
        id: 3,
        name: "CreativeAgency",
        initials: "CA",
        location: "New York, NY",
        jobs_count: 3,
        is_verified: false
    },
    {
        id: 4,
        name: "CloudTech",
        initials: "CT",
        location: "Austin, TX",
        jobs_count: 8,
        is_verified: true
    },
    {
        id: 5,
        name: "InnovateLabs",
        initials: "IL",
        location: "Seattle, WA",
        jobs_count: 15,
        is_verified: true
    },
    {
        id: 6,
        name: "DataWorks",
        initials: "DW",
        location: "Boston, MA",
        jobs_count: 7,
        is_verified: false
    },
    {
        id: 7,
        name: "MobileFirst",
        initials: "MF",
        location: "Los Angeles, CA",
        jobs_count: 4,
        is_verified: true
    },
    {
        id: 8,
        name: "BrandBoost",
        initials: "BB",
        location: "Chicago, IL",
        jobs_count: 6,
        is_verified: false
    }
];

const TestCardsPage = () => {
    return (
        <div className="test-cards-page">
            <div className="container">
                <h1 className="page-title">Job Cards</h1>
                <div className="jobs-grid">
                    {sampleJobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

                <h1 className="page-title" style={{ marginTop: '60px' }}>Company Cards</h1>
                <div className="companies-grid">
                    {sampleCompanies.map(company => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestCardsPage;
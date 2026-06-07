import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  Wifi,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Briefcase,
  IndianRupee,
} from 'lucide-react';
import MatchScore from './MatchScore';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SourceBadge({ source }) {
  const colors = {
    LinkedIn: { bg: 'rgba(10,102,194,0.15)', color: '#0a66c2', border: 'rgba(10,102,194,0.3)' },
    Indeed: { bg: 'rgba(44,62,173,0.15)', color: '#6f7dff', border: 'rgba(44,62,173,0.3)' },
    Glassdoor: { bg: 'rgba(12,170,65,0.15)', color: '#0caa41', border: 'rgba(12,170,65,0.3)' },
  };
  const style = colors[source] || { bg: 'rgba(0,240,255,0.08)', color: '#00f0ff', border: 'rgba(0,240,255,0.2)' };

  return (
    <span
      className="source-badge"
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {source}
    </span>
  );
}

function formatSalary(job) {
  if (!job.min_salary && !job.max_salary) return null;
  const currency = job.salary_currency === 'INR' ? '₹' : '$';
  const formatNum = (n) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n;
  };
  if (job.min_salary && job.max_salary) {
    return `${currency}${formatNum(job.min_salary)} - ${currency}${formatNum(job.max_salary)}`;
  }
  return `${currency}${formatNum(job.min_salary || job.max_salary)}`;
}

function JobCard({ job, index }) {
  const [expanded, setExpanded] = useState(false);
  const salary = formatSalary(job);
  const posted = job.date_posted ? new Date(job.date_posted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <motion.div className="job-card glass-panel" variants={cardVariants} id={`job-card-${index}`}>
      <div className="job-card-top">
        <div className="job-card-left">
          <div className="job-card-company-logo">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company} />
            ) : (
              <Building2 size={22} />
            )}
          </div>
          <div className="job-card-info">
            <h3 className="job-card-title">{job.title}</h3>
            <div className="job-card-meta">
              <span><Building2 size={14} /> {job.company}</span>
              <span><MapPin size={14} /> {job.location}</span>
              {job.is_remote && <span className="remote-tag"><Wifi size={14} /> Remote</span>}
            </div>
          </div>
        </div>

        <div className="job-card-right">
          <MatchScore score={job.match_score || 0} size={64} strokeWidth={4} />
        </div>
      </div>

      {/* Tags row */}
      <div className="job-card-tags">
        <SourceBadge source={job.source} />
        {job.employment_type && (
          <span className="job-type-tag">
            <Briefcase size={12} />
            {job.employment_type === 'FULLTIME' ? 'Full-time' :
             job.employment_type === 'CONTRACTOR' ? 'Contract' :
             job.employment_type === 'PARTTIME' ? 'Part-time' :
             job.employment_type}
          </span>
        )}
        {salary && (
          <span className="salary-tag">
            <IndianRupee size={12} />
            {salary}
            {job.salary_period && <span className="salary-period">/{job.salary_period === 'YEAR' ? 'yr' : job.salary_period.toLowerCase()}</span>}
          </span>
        )}
        {posted && (
          <span className="date-tag">
            <Clock size={12} /> {posted}
          </span>
        )}
      </div>

      {/* Match reason */}
      {job.match_reason && (
        <p className="job-match-reason">{job.match_reason}</p>
      )}

      {/* Skills tags */}
      <div className="job-skills-row">
        {(job.matching_skills || []).slice(0, 6).map((s, i) => (
          <span key={i} className="job-skill-match"><CheckCircle size={12} /> {s}</span>
        ))}
        {(job.missing_skills || []).slice(0, 3).map((s, i) => (
          <span key={i} className="job-skill-missing"><XCircle size={12} /> {s}</span>
        ))}
      </div>

      {/* Expandable description */}
      <button className="job-expand-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? 'Show Less' : 'View Details'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="job-card-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {job.description && (
              <div className="job-description">
                <h4>Job Description</h4>
                <p>{job.description}</p>
              </div>
            )}

            {job.highlights?.qualifications?.length > 0 && (
              <div className="job-qualifications">
                <h4>Qualifications</h4>
                <ul>
                  {job.highlights.qualifications.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.highlights?.responsibilities?.length > 0 && (
              <div className="job-responsibilities">
                <h4>Responsibilities</h4>
                <ul>
                  {job.highlights.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply button */}
      {job.apply_link && (
        <a
          href={job.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="job-apply-btn neon-button"
          id={`apply-btn-${index}`}
        >
          Apply Now
          <ExternalLink size={16} />
        </a>
      )}
    </motion.div>
  );
}

export default function JobResults({ jobs, resumeData }) {
  const [sortBy, setSortBy] = useState('score');

  if (!jobs || jobs.length === 0) return null;

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
    if (sortBy === 'date') return new Date(b.date_posted || 0) - new Date(a.date_posted || 0);
    return 0;
  });

  const avgScore = Math.round(jobs.reduce((sum, j) => sum + (j.match_score || 0), 0) / jobs.length);

  return (
    <section className="job-results-section" id="job-results">
      <div className="container">
        <motion.div
          className="job-results-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-label">Job Matches</div>
          <h2 className="section-title">
            Found <span className="gradient-text">{jobs.length} Jobs</span> For You
          </h2>

          <div className="job-results-summary">
            <div className="job-summary-stat">
              <span className="job-summary-value">{jobs.length}</span>
              <span className="job-summary-label">Jobs Found</span>
            </div>
            <div className="job-summary-stat">
              <span className="job-summary-value" style={{ color: avgScore >= 70 ? '#22c55e' : '#f59e0b' }}>
                {avgScore}%
              </span>
              <span className="job-summary-label">Avg Match</span>
            </div>
            <div className="job-summary-stat">
              <span className="job-summary-value">
                {jobs.filter(j => (j.match_score || 0) >= 75).length}
              </span>
              <span className="job-summary-label">Strong Matches</span>
            </div>
          </div>

          <div className="job-sort-controls">
            <span>Sort by:</span>
            <button
              className={sortBy === 'score' ? 'active' : ''}
              onClick={() => setSortBy('score')}
            >
              Best Match
            </button>
            <button
              className={sortBy === 'date' ? 'active' : ''}
              onClick={() => setSortBy('date')}
            >
              Most Recent
            </button>
          </div>
        </motion.div>

        <motion.div
          className="job-results-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedJobs.map((job, i) => (
            <JobCard key={job.id || i} job={job} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ParseResults({ data, onSearchJobs, isSearching }) {
  const [expanded, setExpanded] = useState(true);

  if (!data) return null;

  return (
    <section className="parse-results-section" id="parse-results">
      <div className="container">
        <motion.div
          className="parse-results-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-label">Parsed Resume</div>
          <h2 className="section-title">
            Your Profile, <span className="gradient-text">Decoded by AI</span>
          </h2>

          <button
            className="parse-toggle"
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle resume details"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </motion.div>

        {expanded && (
          <motion.div
            className="parse-results-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Contact Card */}
            <motion.div className="parse-card contact-card glass-panel" variants={itemVariants}>
              <h3><User size={18} /> Contact Information</h3>
              <div className="contact-details">
                {data.name && (
                  <div className="contact-item">
                    <User size={16} />
                    <span>{data.name}</span>
                  </div>
                )}
                {data.email && (
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.location && (
                  <div className="contact-item">
                    <MapPin size={16} />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
              {data.summary && (
                <p className="contact-summary">{data.summary}</p>
              )}
            </motion.div>

            {/* Skills Cloud */}
            <motion.div className="parse-card skills-card glass-panel" variants={itemVariants}>
              <h3><Sparkles size={18} /> Skills Extracted</h3>
              <div className="skills-cloud">
                {(data.skills || []).map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
              {(!data.skills || data.skills.length === 0) && (
                <p className="parse-empty">No skills detected.</p>
              )}
            </motion.div>

            {/* Experience */}
            <motion.div className="parse-card experience-card glass-panel" variants={itemVariants}>
              <h3><Briefcase size={18} /> Experience</h3>
              <div className="experience-timeline">
                {(data.experience || []).map((exp, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>{exp.title}</h4>
                      <div className="timeline-meta">
                        {exp.company && <span>{exp.company}</span>}
                        {exp.duration && <span className="timeline-duration">{exp.duration}</span>}
                      </div>
                      {exp.description && <p>{exp.description}</p>}
                    </div>
                  </div>
                ))}
                {(!data.experience || data.experience.length === 0) && (
                  <p className="parse-empty">No experience detected.</p>
                )}
              </div>
            </motion.div>

            {/* Education */}
            <motion.div className="parse-card education-card glass-panel" variants={itemVariants}>
              <h3><GraduationCap size={18} /> Education</h3>
              <div className="education-list">
                {(data.education || []).map((edu, i) => (
                  <div key={i} className="education-item">
                    <h4>{edu.degree}</h4>
                    <div className="education-meta">
                      {edu.institution && <span>{edu.institution}</span>}
                      {edu.year && <span className="education-year">{edu.year}</span>}
                    </div>
                  </div>
                ))}
                {(!data.education || data.education.length === 0) && (
                  <p className="parse-empty">No education detected.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Search Jobs CTA */}
        <motion.div
          className="parse-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            className="neon-button search-jobs-btn"
            onClick={onSearchJobs}
            disabled={isSearching}
            id="search-jobs-btn"
          >
            {isSearching ? (
              <>
                <div className="btn-spinner"></div>
                Searching Jobs...
              </>
            ) : (
              <>
                <Search size={18} />
                Search Matching Jobs
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="parse-cta-subtitle">
            We'll search LinkedIn, Indeed, Glassdoor & more for jobs matching your profile
          </p>
        </motion.div>
      </div>
    </section>
  );
}

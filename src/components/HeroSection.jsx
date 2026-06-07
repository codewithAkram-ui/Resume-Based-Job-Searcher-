import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import ThreeScene from './ThreeScene';

export default function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      {/* 3D Background */}
      <div className="hero-bg-canvas">
        <ThreeScene />
      </div>

      <div className="hero-content">
        {/* Left: Text */}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="hero-badge" id="hero-badge">
            <span className="hero-badge-dot"></span>
            Powered by Advanced AI
          </div>

          <h1 className="hero-title" id="hero-title">
            Parse Resumes.<br />
            <span className="highlight">Match Talent.</span><br />
            Instantly.
          </h1>

          <p className="hero-description">
            Upload any resume and let our AI extract skills, experience, and
            qualifications — then match candidates to the perfect roles with
            unparalleled accuracy.
          </p>

          <div className="hero-actions">
            <a href="#upload" className="neon-button" id="hero-cta-primary">
              <Sparkles size={18} />
              Upload Resume
            </a>
            <a href="#features" className="outline-button" id="hero-cta-secondary">
              Learn More
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">98.7%</div>
              <div className="hero-stat-label">Parse Accuracy</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">2.1s</div>
              <div className="hero-stat-label">Avg. Parse Time</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">50K+</div>
              <div className="hero-stat-label">Resumes Parsed</div>
            </div>
          </div>
        </motion.div>

        {/* Right: Visual glow placeholder behind 3D */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="hero-visual-glow"></div>
        </motion.div>
      </div>
    </section>
  );
}

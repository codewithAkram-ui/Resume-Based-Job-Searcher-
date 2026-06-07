import { motion } from 'framer-motion';
import {
  FileSearch,
  Brain,
  Target,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    color: 'cyan',
    title: 'Smart Resume Parsing',
    description:
      'Extracts key data — name, skills, experience, education — from any resume format including PDF, DOCX, and even images.',
  },
  {
    icon: Brain,
    color: 'violet',
    title: 'AI Skill Extraction',
    description:
      'Our NLP engine identifies hard and soft skills, ranks proficiency levels, and maps competencies to industry frameworks.',
  },
  {
    icon: Target,
    color: 'magenta',
    title: 'Job Matching Engine',
    description:
      'Matches candidates to open positions using multi-dimensional scoring across skills, experience, culture fit, and more.',
  },
  {
    icon: BarChart3,
    color: 'blue',
    title: 'Analytics Dashboard',
    description:
      'Visualize hiring funnels, skill gaps, and talent pipeline health with real-time interactive analytics.',
  },
  {
    icon: Shield,
    color: 'green',
    title: 'Bias-Free Screening',
    description:
      'Ensures fair and equitable evaluation of candidates by eliminating unconscious bias from the screening pipeline.',
  },
  {
    icon: Zap,
    color: 'cyan',
    title: 'Lightning Fast Results',
    description:
      'Process hundreds of resumes in seconds. Our optimized pipeline delivers parsed results with sub-second latency.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <motion.div
        className="features-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-label">Features</div>
        <h2 className="section-title">
          Everything You Need to <span className="gradient-text">Hire Smarter</span>
        </h2>
        <p className="section-subtitle">
          From parsing to matching, our AI-driven platform automates every step
          of the talent acquisition pipeline with surgical precision.
        </p>
      </motion.div>

      <motion.div
        className="features-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              className="feature-card"
              variants={cardVariants}
              id={`feature-card-${index}`}
            >
              <div className={`feature-card-icon ${feature.color}`}>
                <Icon size={26} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

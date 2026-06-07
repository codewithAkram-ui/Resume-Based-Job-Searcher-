import { Brain } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="navbar-logo-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
            <Brain size={16} strokeWidth={2.5} style={{ color: '#050510' }} />
          </div>
          <span className="footer-brand-text">ResumeAI</span>
        </div>

        <ul className="footer-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#upload">Upload</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>

        <p className="footer-copy">
          © {currentYear} ResumeAI. All rights reserved. Built with cutting-edge AI.
        </p>
      </div>
    </footer>
  );
}

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, Loader, AlertCircle } from 'lucide-react';

export default function UploadSection({ onParsed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadAndParse = useCallback(async (file) => {
    setUploadedFile(file);
    setIsParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed (${response.status})`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        onParsed(result.data);
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to parse resume. Make sure the backend is running.');
      setUploadedFile(null);
    } finally {
      setIsParsing(false);
    }
  }, [onParsed]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadAndParse(file);
  }, [uploadAndParse]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) uploadAndParse(file);
  }, [uploadAndParse]);

  return (
    <section className="upload-section" id="upload">
      <div className="upload-wrapper">
        {/* Left info */}
        <motion.div
          className="upload-info"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Upload</div>
          <h2 className="section-title" id="upload-title">
            Drop Your Resume.<br />
            <span className="gradient-text">Watch the Magic.</span>
          </h2>
          <p className="section-subtitle">
            Our AI scanner analyzes your resume in real-time, extracting
            structured data with pinpoint accuracy, then matches you to real jobs
            from LinkedIn, Indeed, and Glassdoor.
          </p>

          <ol className="upload-steps" id="how-it-works">
            <li className="upload-step">
              <div className="upload-step-number">1</div>
              <div className="upload-step-text">
                <h4>Upload Your File</h4>
                <p>Drag & drop or click to browse. We support PDF, DOCX, and TXT.</p>
              </div>
            </li>
            <li className="upload-step">
              <div className="upload-step-number">2</div>
              <div className="upload-step-text">
                <h4>AI Parses & Extracts</h4>
                <p>Our NLP engine identifies skills, education, experience, and more.</p>
              </div>
            </li>
            <li className="upload-step">
              <div className="upload-step-number">3</div>
              <div className="upload-step-text">
                <h4>Get Matched Instantly</h4>
                <p>Receive job matches from real platforms, ranked by AI compatibility.</p>
              </div>
            </li>
          </ol>
        </motion.div>

        {/* Right upload zone */}
        <motion.div
          className="upload-zone-wrapper"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label
            className={`upload-zone ${isDragging ? 'drag-active' : ''} ${isParsing ? 'parsing' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            htmlFor="file-input"
            id="upload-zone"
          >
            <div className="scan-line"></div>

            {isParsing ? (
              <>
                <div className="upload-zone-icon parsing-icon">
                  <Loader size={28} className="spin-icon" />
                </div>
                <h3>Analyzing Resume...</h3>
                <p>AI is extracting your skills & experience</p>
                <div className="parse-progress-bar">
                  <div className="parse-progress-fill"></div>
                </div>
              </>
            ) : uploadedFile && !error ? (
              <>
                <div className="upload-zone-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                  <CheckCircle size={28} />
                </div>
                <h3 style={{ color: '#22c55e' }}>File Uploaded!</h3>
                <p>{uploadedFile.name}</p>
                <span className="supported">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </span>
              </>
            ) : (
              <>
                <div className="upload-zone-icon">
                  {isDragging ? <FileText size={28} /> : <Upload size={28} />}
                </div>
                <h3>{isDragging ? 'Drop it here!' : 'Drag & Drop Resume'}</h3>
                <p>or click to browse files</p>
                <span className="supported">PDF, DOCX, TXT — Max 10MB</span>
              </>
            )}

            <input
              type="file"
              id="file-input"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isParsing}
            />
          </label>

          {/* Error message */}
          {error && (
            <motion.div
              className="upload-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

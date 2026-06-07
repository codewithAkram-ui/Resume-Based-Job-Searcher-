import { Suspense, useState, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import UploadSection from './components/UploadSection';
import ParseResults from './components/ParseResults';
import JobResults from './components/JobResults';
import Footer from './components/Footer';

function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050510',
        color: '#00f0ff',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.1rem',
        letterSpacing: '0.1em',
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  // Multi-step state
  const [parsedData, setParsedData] = useState(null);
  const [jobResults, setJobResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const resultsRef = useRef(null);
  const jobsRef = useRef(null);

  // Called when resume is parsed successfully
  const handleParsed = useCallback((data) => {
    setParsedData(data);
    setJobResults(null);
    setSearchError(null);

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, []);

  // Called when user clicks "Search Jobs"
  const handleSearchJobs = useCallback(async () => {
    if (!parsedData) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // Build query from suggested titles and skills
      const suggestedTitles = parsedData.suggested_job_titles || [];
      const topSkills = (parsedData.skills || []).slice(0, 5);
      const query = suggestedTitles.length > 0
        ? suggestedTitles[0]
        : topSkills.join(' ');

      // Step 1: Search for jobs
      const searchRes = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          location: parsedData.location || 'India',
          remote_only: false,
          date_posted: 'month',
        }),
      });

      if (!searchRes.ok) {
        const err = await searchRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Job search failed');
      }

      const searchData = await searchRes.json();
      const jobs = searchData.data || [];

      if (jobs.length === 0) {
        setJobResults([]);
        setIsSearching(false);
        return;
      }

      // Step 2: Match jobs against resume
      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsed_resume: parsedData,
          jobs,
        }),
      });

      if (!matchRes.ok) {
        // If matching fails, show jobs without scores
        setJobResults(jobs.map(j => ({ ...j, match_score: 50, match_reason: 'Score unavailable.' })));
      } else {
        const matchData = await matchRes.json();
        setJobResults(matchData.data || []);
      }

      // Scroll to job results
      setTimeout(() => {
        jobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message || 'Failed to search jobs. Make sure the backend is running.');
    } finally {
      setIsSearching(false);
    }
  }, [parsedData]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <UploadSection onParsed={handleParsed} />

        {/* Parsed Results */}
        {parsedData && (
          <div ref={resultsRef}>
            <ParseResults
              data={parsedData}
              onSearchJobs={handleSearchJobs}
              isSearching={isSearching}
            />
          </div>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="container" style={{ textAlign: 'center', padding: '20px 24px' }}>
            <p style={{ color: '#ef4444' }}>{searchError}</p>
          </div>
        )}

        {/* Job Results */}
        {jobResults && (
          <div ref={jobsRef}>
            <JobResults jobs={jobResults} resumeData={parsedData} />
          </div>
        )}
      </main>
      <Footer />
    </Suspense>
  );
}

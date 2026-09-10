import { useState, useMemo } from 'react';
import UploadSection from './components/UploadSection';
import Dashboard from './pages/Dashboard';
import { analyzeDataset } from './services/api';
import { generateInsights } from './utils/insightsGenerator';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const insights = useMemo(() => {
    if (!analysisData) return [];
    return generateInsights(analysisData);
  }, [analysisData]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeDataset(selectedFile);
      setAnalysisData(result.analysis);
      setFilename(result.filename || selectedFile.name);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewDataset = () => {
    setAnalysisData(null);
    setSelectedFile(null);
    setFilename('');
    setError(null);
  };

  return (
    <div className="prism-app-root">
      {!analysisData ? (
        <UploadSection
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          error={error}
        />
      ) : (
        <Dashboard
          analysis={analysisData}
          filename={filename}
          insights={insights}
          onNewDataset={handleNewDataset}
          onRefreshAnalysis={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}

export default App;
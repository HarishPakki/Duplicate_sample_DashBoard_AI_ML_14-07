import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import ExecutionTable from './ExecutionTable';
import ExecutionDetail from './ExecutionDetail';
import ResultAnalysis from './ResultAnalysis';
import ResultsOverview from './ResultsOverview';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<ExecutionTable />} />
          <Route path="/execution/:reportIndex/:name" element={<ExecutionDetail />} />
          <Route path="/result-analysis" element={<ResultAnalysis />} />
          <Route path="/results-overview" element={<ResultsOverview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

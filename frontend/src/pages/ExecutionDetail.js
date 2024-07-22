import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { predictNextValue } from '../utils/predictiveModel';
import './ExecutionDetail.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ExecutionDetail = ({ reports }) => {
  const { reportIndex, name } = useParams();
  const report = reports.find(r => r.name === name);
  const [prediction, setPrediction] = useState(null);
  const [errorPopup, setErrorPopup] = useState({ show: false, error: '', step: '' });
  const [errorAnalysisPopup, setErrorAnalysisPopup] = useState({ show: false, analysis: [] });
  const [exportType, setExportType] = useState('CSV');

  useEffect(() => {
    const getPrediction = async () => {
      // const nextValue = await predictNextValue(5); // Example input
      // setPrediction(nextValue);
    };

    getPrediction();
  }, []);

  if (!report || !report.data) {
    return <div>Report not found</div>;
  }

  const featureData = (report.data || []).map(feature => ({
    label: feature.name,
    total: feature.elements.length,
    passed: feature.elements.filter(e => e.steps.every(s => s.result.status === 'passed')).length,
    failed: feature.elements.filter(e => e.steps.some(s => s.result.status === 'failed')).length,
  }));

  const totalPassed = featureData.reduce((acc, fd) => acc + fd.passed, 0);
  const totalFailed = featureData.reduce((acc, fd) => acc + fd.failed, 0);

  const pieData = {
    labels: ['Passed', 'Failed'],
    datasets: [{
      data: [totalPassed, totalFailed],
      backgroundColor: ['#4CAF50', '#FF0000'],
      borderColor: '#000',
      borderWidth: 1
    }],
  };

const allTestCases=[];
report.data.forEach(element=>{
allTestCases.push(...element.elements)


});

  const downloadLogs = () => {
    window.open(`http://localhost:5000/api/reports/logs/downloadFile/${report.name}`, '_blank');
  };

  const openErrorPopup = (error, step) => {
    setErrorPopup({ show: true, error, step });
  };

  const closeErrorPopup = () => {
    setErrorPopup({ show: false, error: '', step: '' });
  };

  const performErrorAnalysis = () => {
    const analysis = [];
    report.data.forEach(feature => {
      feature.elements.forEach(testCase => {
        testCase.steps.forEach(step => {
          if (step.result.status === 'failed') {
            const errorMessage = step.result.error_message.split('\n')[0]; // Simplified error message
            const existingAnalysis = analysis.find(a => a.error === errorMessage);
            if (existingAnalysis) {
              existingAnalysis.count += 1;
              existingAnalysis.testCases.push(testCase.name);
              existingAnalysis.steps.push(step.name);
            } else {
              analysis.push({ error: errorMessage, count: 1, testCases: [testCase.name], steps: [step.name] });
            }
          }
        });
      });
    });
    setErrorAnalysisPopup({ show: true, analysis });
  };

  const closeErrorAnalysisPopup = () => {
    setErrorAnalysisPopup({ show: false, analysis: [] });
  };

  const exportTableToCSV = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.csv`);
  };

  const exportTableToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportTableToPDF = (data, columns, filename) => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns],
      body: data.map(row => columns.map(col => row[col.toLowerCase()])),
    });
    doc.save(`${filename}.pdf`);
  };

  const handleDownload = (data, columns, filename) => {
    if (exportType === 'CSV') {
      exportTableToCSV(data, filename);
    } else if (exportType === 'Excel') {
      exportTableToExcel(data, filename);
    } else if (exportType === 'PDF') {
      exportTableToPDF(data, columns, filename);
    }
  };

  const testCaseColumns = ["Test Case", "Status", "Start Time", "End Time", "Error"];
  const testCaseData = (allTestCases || []).map((testCase, index) => ({
    "Test Case": testCase.name,
    "Status": (testCase.steps || []).every(s => s.result?.status === 'passed') ? 'Passed' : (testCase.steps || []).some(s => s.result?.status === 'failed') ? 'Failed' : 'Skipped',
    "Start Time": testCase.start_timestamp || 'N/A',
    "End Time": testCase.end_timestamp || 'N/A',
    "Error": (testCase.steps || []).some(s => s.result?.status === 'failed') ? 'Failed' : ''
  }));

  return (
    <div className="execution-detail">
      <h2>Execution Detail</h2>
      <h3>{name}</h3>
      <div className="summary-section">
        <div className="summary-left">
          <h3>Feature Files</h3>
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Total</th>
                  <th>Passed</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {featureData.map((feature, index) => (
                  <tr key={index}>
                    <td>{feature.label}</td>
                    <td>{feature.total}</td>
                    <td>{feature.passed}</td>
                    <td>{feature.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="summary-right">
          <h3>Test Cases Overview</h3>
          <div className="pie-chart-container">
            <Pie data={pieData} />
          </div>
        </div>
      </div>
      {prediction !== null && (
        <div className="prediction">
          <h3>Next Predicted Value: {prediction}</h3>
        </div>
      )}
      <div className="buttons-container">
        <button className="btn download-btn" onClick={downloadLogs}>
          <i className="fa fa-download"></i> Download Logs
        </button>
        <button className="btn error-analysis-btn" onClick={performErrorAnalysis}>
          <i className="fa fa-search"></i> Error Analysis
        </button>
      </div>
      <div className="testcase-section">
        <h3>Test Cases</h3>
        <div className="table-container">
          <div className="export-dropdown">
            <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
              <option value="PDF">PDF</option>
            </select>
            <button className="btn download-btn" onClick={() => handleDownload(testCaseData, testCaseColumns, "TestCases")}>
              Download
            </button>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {(allTestCases || []).map((testCase, testCaseIndex) => (
                <tr key={`${testCaseIndex}`}>
                  <td>
                    <Link to={`/testcase/${reportIndex}/${testCaseIndex}`}state={{steps:testCase.steps,name:report.name}}>
                      {testCase.name}
                    </Link>
                  </td>
                  <td style={{ color: (testCase.steps || []).every(s => s.result?.status === 'passed') ? 'green' : (testCase.steps || []).some(s => s.result?.status === 'failed') ? 'red' : 'gray' }}>
                    {(testCase.steps || []).every(s => s.result?.status === 'passed') ? 'Passed' : (testCase.steps || []).some(s => s.result?.status === 'failed') ? <a onClick={() => openErrorPopup(testCase.steps.find(s => s.result?.status === 'failed').result.error_message, testCase.steps.find(s => s.result?.status === 'failed').name)}>Failed</a> : 'Skipped'}
                  </td>
                  <td>{testCase.start_timestamp || 'N/A'}</td>
                  <td>{testCase.end_timestamp || 'N/A'}</td>
                  <td>
                    {(testCase.steps || []).some(s => s.result?.status === 'failed') &&
                      <button className="btn error-btn" onClick={() => openErrorPopup(testCase.steps.find(s => s.result?.status === 'failed').result.error_message, testCase.steps.find(s => s.result?.status === 'failed').name)}>
                        View Error Details
                      </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {errorPopup.show && (
        <div className="error-popup-overlay" onClick={closeErrorPopup}>
          <div className="error-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeErrorPopup}>&times;</button>
            <h2>Error Details</h2>
            <h3>Failed Step: {errorPopup.step}</h3>
            <p>{errorPopup.error}</p>
          </div>
        </div>
      )}
      {errorAnalysisPopup.show && (
        <div className="error-analysis-popup-overlay" onClick={closeErrorAnalysisPopup}>
          <div className="error-analysis-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeErrorAnalysisPopup}>&times;</button>
            <h2>Error Analysis</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Error</th>
                    <th>Count</th>
                    <th>Test Cases</th>
                    <th>Steps</th>
                  </tr>
                </thead>
                <tbody>
                  {errorAnalysisPopup.analysis.map((item, index) => (
                    <tr key={index}>
                      <td>{item.error}</td>
                      <td>{item.count}</td>
                      <td>{item.testCases.join(', ')}</td>
                      <td>{item.steps.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <Link to="/" className="home-button">Home</Link>
    </div>
  );
};

export default ExecutionDetail;

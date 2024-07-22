import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import Filters from '../components/Filters';
import '../components/ExecutionTable.css';
import { FaFilter, FaSort } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const ExecutionTable = ({ reports }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedReports, setSelectedReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPopupVisible, setFilterPopupVisible] = useState(false);
    const [filterColumn, setFilterColumn] = useState("");
    const [exportType, setExportType] = useState("CSV");
    const [selectedProject, setSelectedProject] = useState("");
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState("reports");

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (Array.isArray(reports)) {
            setFilteredReports(reports);
            // Extract project names from execution names
            const projectNames = [...new Set(reports.map(report => report.name.split('_').slice(0, -3).join('_')))];
            setProjects(projectNames);
        }
    }, [reports]);

    const applyFilters = () => {
        let updatedReports = Array.isArray(reports) ? reports : [];

        if (selectedProject) {
            updatedReports = updatedReports.filter(report => {
                const projectName = report.name.split('_').slice(0, -3).join('_');
                return projectName === selectedProject;
            });
        }

        if (filters.startDate) {
            updatedReports = updatedReports.filter(report => new Date(report.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            updatedReports = updatedReports.filter(report => new Date(report.timestamp) <= new Date(filters.endDate));
        }

        if (searchTerm) {
            updatedReports = updatedReports.filter(report =>
                report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (report.timestamp && report.timestamp.split('T')[0].includes(searchTerm)) ||
                (getStatus(report.data[0]?.elements).toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredReports(updatedReports);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, searchTerm, selectedProject]);

    const indexOfLastReport = currentPage * 10; // Use a constant value for reportsPerPage
    const indexOfFirstReport = indexOfLastReport - 10; // Use a constant value for reportsPerPage
    const currentReports = Array.isArray(filteredReports) ? filteredReports.slice(indexOfFirstReport, indexOfLastReport) : [];

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber);

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const toggleFilterPopup = (column) => {
        setFilterColumn(column);
        setFilterPopupVisible(filterColumn !== column || !filterPopupVisible);
    };

    const getStatus = (elements) => {
        if (!elements || !Array.isArray(elements)) return 'N/A';
        return elements.some(el => el.steps && el.steps.some(step => step.result?.status === 'failed')) ? 'Failed' : 'Passed';
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
        XLSX.writeFile(workbook, "Reports.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.autoTable({
            head: [['Serial Number', 'Execution Name', 'Executed Date', 'Status']],
            body: filteredReports.map((report, index) => [
                index + 1,
                report.name,
                report.timestamp ? new Date(report.timestamp).toLocaleString() : 'N/A',
                getStatus(report.data[0]?.elements)
            ])
        });
        doc.save('Reports.pdf');
    };

    const handleDownload = () => {
        if (exportType === "CSV") {
            document.getElementById('csv-export').click();
        } else if (exportType === "Excel") {
            exportToExcel();
        } else if (exportType === "PDF") {
            exportToPDF();
        }
    };

    const handleReportSelection = (report) => {
        const isSelected = selectedReports.includes(report);
        if (isSelected) {
            setSelectedReports(selectedReports.filter(r => r !== report));
        } else {
            if (selectedReports.length < 5) {
                setSelectedReports([...selectedReports, report]);
            } else {
                alert('You can select a maximum of 5 executions.');
            }
        }
    };

    const generateFeedback = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/reports/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ executions: selectedReports }),
            });
            const feedbackData = await response.json();
            navigate('/result-analysis', { state: { feedbackData } });
        } catch (error) {
            console.error('Error generating feedback:', error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const projectData = projects.map(project => {
        const projectReports = reports.filter(report => report.name.startsWith(project));
        const totalPassed = projectReports.reduce((acc, report) => acc + (report.data[0].elements || []).filter(e => e.steps.every(s => s.result.status === 'passed')).length, 0);
        const totalFailed = projectReports.reduce((acc, report) => acc + (report.data[0].elements || []).filter(e => e.steps.some(s => s.result.status === 'failed')).length, 0);
        return { project, totalPassed, totalFailed };
    });

    const pieData = {
        labels: projects,
        datasets: [{
            label: 'Passed',
            data: projectData.map(d => d.totalPassed),
            backgroundColor: '#4CAF50'
        }, {
            label: 'Failed',
            data: projectData.map(d => d.totalFailed),
            backgroundColor: '#FF0000'
        }]
    };

    const barData = {
        labels: projects,
        datasets: [{
            label: 'Passed',
            data: projectData.map(d => d.totalPassed),
            backgroundColor: '#4CAF50'
        }, {
            label: 'Failed',
            data: projectData.map(d => d.totalFailed),
            backgroundColor: '#FF0000'
        }]
    };

    return (
        <div className="execution-table-container">
            <h2>Report Analysis</h2>
            <div className="tab-buttons">
                <button className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabChange('reports')}>Execution Reports</button>
                <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>Results Overview</button>
            </div>
            {activeTab === 'reports' && (
                <>
                    <div className="filters-container">
                        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                            <option value="">Select Project</option>
                            {projects.map((project, index) => (
                                <option key={index} value={project}>{project}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="startDate"
                            placeholder="Start Date"
                            value={filters.startDate}
                            onChange={(e) => handleFiltersChange({ ...filters, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            name="endDate"
                            placeholder="End Date"
                            value={filters.endDate}
                            onChange={(e) => handleFiltersChange({ ...filters, endDate: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="export-dropdown">
                            <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
                                <option value="CSV">CSV</option>
                                <option value="Excel">Excel</option>
                                <option value="PDF">PDF</option>
                            </select>
                            <button className="btn download-btn" onClick={handleDownload}>Download</button>
                            <CSVLink
                                data={filteredReports}
                                filename={"Reports.csv"}
                                className="hidden"
                                id="csv-export"
                                target="_blank"
                            />
                        </div>
                    </div>
                    <button 
                        className="btn feedback-btn" 
                        onClick={generateFeedback} 
                        disabled={selectedReports.length === 0}
                    >
                        Generate Feedback
                    </button>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Serial Number</th>
                                <th>Execution Name</th>
                                <th>Executed Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReports.map((report, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.includes(report)}
                                            onChange={() => handleReportSelection(report)}
                                        />
                                    </td>
                                    <td>{indexOfFirstReport + index + 1}</td>
                                    <td><Link to={`/execution/${index}/${report.name}`}>{report.name}</Link></td>
                                    <td>{report.timestamp ? new Date(report.timestamp).toLocaleString() : 'N/A'}</td>
                                    <td>{getStatus(report.data[0]?.elements)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        reportsPerPage={10} // Use a constant value for reportsPerPage
                        totalReports={filteredReports.length}
                        paginate={handlePagination}
                        currentPage={currentPage}
                    />
                </>
            )}
            {activeTab === 'overview' && (
                <div className="results-overview">
                    <h3>Results Overview</h3>
                    <div className="chart-container">
                        <Pie 
                            data={pieData} 
                            options={{
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const project = context.label;
                                                const passed = context.dataset.data[context.dataIndex];
                                                const total = projectData.find(d => d.project === project).totalPassed + projectData.find(d => d.project === project).totalFailed;
                                                const percentage = ((passed / total) * 100).toFixed(2);
                                                return `${project}: ${context.dataset.label} - ${passed} (${percentage}%)`;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="chart-container">
                        <Bar 
                            data={barData} 
                            options={{
                                scales: {
                                    x: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Projects'
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Test Cases'
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top'
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return `${context.dataset.label}: ${context.raw}`;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutionTable;

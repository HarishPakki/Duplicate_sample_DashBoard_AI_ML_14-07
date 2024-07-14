import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import Filters from './Filters';
import './ExecutionTable.css';
import { FaFilter, FaSort  } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExecutionTable = ({ reports }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedReports, setSelectedReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPopupVisible, setFilterPopupVisible] = useState(false);
    const [filterColumn, setFilterColumn] = useState("");
    const [exportType, setExportType] = useState("CSV");

    const [filters, setFilters] = useState({
        team: '',
        type: '',
        user: '',
        startDate: '',
        endDate: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (Array.isArray(reports)) {
            setFilteredReports(reports);
        }
    }, [reports]);

    const applyFilters = () => {
        let updatedReports = Array.isArray(reports) ? reports : [];

        if (filters.team) {
            updatedReports = updatedReports.filter(report => report.team === filters.team);
        }

        if (filters.type) {
            updatedReports = updatedReports.filter(report => report.type === filters.type);
        }

        if (filters.user) {
            updatedReports = updatedReports.filter(report => report.user === filters.user);
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
                (report.team && report.team.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (report.timestamp && report.timestamp.split('T')[0].includes(searchTerm)) ||
                (getStatus(report.data[0]?.elements).toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredReports(updatedReports);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, searchTerm]);

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
            head: [['Serial Number', 'Execution Name', 'Team', 'Executed Date', 'Status']],
            body: filteredReports.map((report, index) => [
                index + 1,
                report.name,
                report.team || 'N/A',
                report.timestamp ? report.timestamp.split('T')[0] : 'N/A',
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

    return (
        <div className="execution-table-container">
            <h2>Execution Reports</h2>
            <Filters filters={filters} onChange={handleFiltersChange} />
            <div className="search-and-export">
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
                        <th onClick={() => toggleFilterPopup('serialNumber')}>
                            Serial Number <FaSort />
                            {filterColumn === 'serialNumber' && filterPopupVisible && (
                                <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        placeholder="Search Serial Number"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                        </th>
                        <th onClick={() => toggleFilterPopup('name')}>
                            Execution Name <FaSort /> <FaFilter />
                            {filterColumn === 'name' && filterPopupVisible && (
                                <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        placeholder="Search Execution Name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                        </th>
                        <th onClick={() => toggleFilterPopup('team')}>
                            Team <FaSort /> <FaFilter />
                            {filterColumn === 'team' && filterPopupVisible && (
                                <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        placeholder="Search Team"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                        </th>
                        <th onClick={() => toggleFilterPopup('executedDate')}>
                            Executed Date <FaSort /> <FaFilter />
                            {filterColumn === 'executedDate' && filterPopupVisible && (
                                <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        placeholder="Search Executed Date"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                        </th>
                        <th onClick={() => toggleFilterPopup('status')}>
                            Status <FaSort /> <FaFilter />
                            {filterColumn === 'status' && filterPopupVisible && (
                                <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        placeholder="Search Status"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                        </th>
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
                            <td><Link to={`/execution/${report.name}`}>{report.name}</Link></td>
                            <td>{report.team || 'N/A'}</td>
                            <td>{report.timestamp ? report.timestamp.split('T')[0] : 'N/A'}</td>
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
        </div>
    );
};

export default ExecutionTable;

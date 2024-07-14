// src/components/Pagination.js
import React from 'react';
import './Pagination.css';

const Pagination = ({ reportsPerPage, totalReports, paginate, currentPage }) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalReports / reportsPerPage);
    const maxPageNumbersToShow = 10;
    let startPage, endPage;

    if (totalPages <= maxPageNumbersToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrentPage = Math.floor(maxPageNumbersToShow / 2);
        const maxPagesAfterCurrentPage = Math.ceil(maxPageNumbersToShow / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
            startPage = 1;
            endPage = maxPageNumbersToShow;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
            startPage = totalPages - maxPageNumbersToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav>
            <ul className="pagination">
                <li className="page-item">
                    <button onClick={() => paginate(1)} className="page-link" disabled={currentPage === 1}>
                        &laquo;
                    </button>
                </li>
                <li className="page-item">
                    <button onClick={() => paginate(currentPage - 1)} className="page-link" disabled={currentPage === 1}>
                        &lt;
                    </button>
                </li>
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button onClick={() => paginate(number)} className="page-link">
                            {number}
                        </button>
                    </li>
                ))}
                <li className="page-item">
                    <button onClick={() => paginate(currentPage + 1)} className="page-link" disabled={currentPage === totalPages}>
                        &gt;
                    </button>
                </li>
                <li className="page-item">
                    <button onClick={() => paginate(totalPages)} className="page-link" disabled={currentPage === totalPages}>
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;

// src/components/Filters.js
import React from 'react';
import './Filters.css';

const Filters = ({ filters, onChange }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...filters, [name]: value });
    };

    return (
        <div className="filters-container">
            <select name="team" value={filters.team} onChange={handleInputChange}>
                <option value="">All Teams</option>
                {/* Add team options here */}
            </select>
            <select name="type" value={filters.type} onChange={handleInputChange}>
                <option value="">All Types</option>
                {/* Add type options here */}
            </select>
            <select name="user" value={filters.user} onChange={handleInputChange}>
                <option value="">All Users</option>
                {/* Add user options here */}
            </select>
            <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
                disabled
            />
            <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
                disabled
            />
            <input
                type="text"
                name="search"
                placeholder="Search..."
                value={filters.search}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default Filters;

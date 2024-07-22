import React from 'react';
import './Filters.css';

const Filters = ({ filters, onChange }) => {
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...filters, [name]: value });
    };

    return (
        <div className="filters">
            <input
                type="date"
                name="startDate"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={handleFilterChange}
            />
            <input
                type="date"
                name="endDate"
                placeholder="End Date"
                value={filters.endDate}
                onChange={handleFilterChange}
            />
        </div>
    );
};

export default Filters;

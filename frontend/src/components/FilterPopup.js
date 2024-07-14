import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './FilterPopup.css';

const FilterPopup = ({ column, onApply }) => {
    const [filterValue, setFilterValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSearchChange = (event) => {
        setFilterValue(event.target.value);
    };

    const handleApply = () => {
        onApply(filterValue);
        setIsOpen(false);
    };

    return (
        <div className="filter-popup">
            <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
                <FaFilter />
            </button>
            {isOpen && (
                <div className="filter-dropdown">
                    <input
                        type="text"
                        value={filterValue}
                        onChange={handleSearchChange}
                        placeholder={`Filter ${column}`}
                    />
                    <button onClick={handleApply}><FaSearch /></button>
                </div>
            )}
        </div>
    );
};

export default FilterPopup;

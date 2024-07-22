import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <li><NavLink to="/" activeClassName="active">Execution Reports</NavLink></li>
          <li><NavLink to="/results-overview" activeClassName="active">Results Overview</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

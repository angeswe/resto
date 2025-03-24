import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaGithub, FaBook } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/resto-icon.svg" alt="Resto" className="h-8 w-8" />
            <span className="text-xl font-bold text-[var(--text-primary)]">Resto</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-6">
            <Link 
              to="/docs" 
              className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              <FaBook className="h-4 w-4" />
              <span>Docs</span>
            </Link>
            <a 
              href="https://github.com/codeium/resto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FaMoon className="h-5 w-5" /> : <FaSun className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

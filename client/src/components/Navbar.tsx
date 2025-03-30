import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaCode, FaGithub } from 'react-icons/fa';
import { Button } from '@heroui/react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { API_URLS } from '../config/api';

interface NavbarProps {
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <nav className={`border-b border-divider bg-background ${currentTheme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/resto-icon.svg" alt="Resto" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">Resto</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-6">
            <Link
              to="/docs"
              className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors duration-200"
            >
              <FaBook className="h-4 w-4" />
              <span>Docs</span>
            </Link>
            <a
              href={API_URLS.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors duration-200"
            >
              <FaCode className="h-4 w-4" />
              <span>API</span>
            </a>
            <a
              href="https://github.com/angeswe/resto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors duration-200"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            isIconOnly
            variant="light"
            aria-label="Toggle theme"
            onClick={() => onThemeChange(currentTheme === 'light' ? 'dark' : 'light')}
          >
            {currentTheme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

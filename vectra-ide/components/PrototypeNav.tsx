import React from 'react';
import { Link } from 'react-router-dom';

export const PrototypeNav: React.FC = () => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 text-sm font-medium border border-white/20">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">Screens</span>
            <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
            <Link to="/editor" className="hover:text-blue-400 transition-colors">Code Editor</Link>
            <Link to="/projects" className="hover:text-blue-400 transition-colors">Projects</Link>
            <Link to="/settings" className="hover:text-blue-400 transition-colors">Settings</Link>
            <Link to="/canvas" className="hover:text-blue-400 transition-colors">Visual Canvas</Link>
        </div>
    );
};
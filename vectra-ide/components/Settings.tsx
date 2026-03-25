import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';

export const SettingsScreen: React.FC = () => {
    const { settings, updateSettings } = useApp();
    const [localNodePath, setLocalNodePath] = useState(settings.nodePath);

    useEffect(() => {
        setLocalNodePath(settings.nodePath);
    }, [settings]);

    const handleSave = () => {
        updateSettings({ nodePath: localNodePath });
        alert("Settings saved successfully!");
    };

    const handleDiscard = () => {
        if(confirm("Discard unsaved changes?")) {
            setLocalNodePath(settings.nodePath);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200 h-screen w-full">
            <div className="relative flex h-full w-full flex-row overflow-hidden">
                <div className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4">
                    <div className="flex flex-col gap-8 h-full">
                        <div className="flex gap-3 px-2 pt-2">
                            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                                {/* VECTRA LOGO */}
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2L2 7V17L12 22L22 17V7L12 2ZM7.5 9L12 16.5L16.5 9H13.5L12 12.5L10.5 9H7.5Z" />
                                </svg>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-text-main dark:text-white text-base font-bold leading-none">Vectra</h1>
                                <p className="text-text-sub dark:text-gray-400 text-xs font-normal mt-1">v1.0.4 Local</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto flex-1">
                            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                                <span className="material-symbols-outlined text-text-main dark:text-gray-400 group-hover:text-black dark:group-hover:text-white">arrow_back</span>
                                <p className="text-text-main dark:text-gray-300 text-sm font-medium">Back to Home</p>
                            </Link>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-full bg-primary shadow-sm cursor-pointer mt-4">
                                <span className="material-symbols-outlined text-white font-semibold">database</span>
                                <p className="text-white text-sm font-semibold">Environment</p>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                                <span className="material-symbols-outlined text-text-main dark:text-gray-400 group-hover:text-black dark:group-hover:text-white">psychology</span>
                                <p className="text-text-main dark:text-gray-300 text-sm font-medium">AI Configuration</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-text-main dark:text-white text-2xl font-bold leading-tight">Environment Settings</h2>
                            <p className="text-text-sub dark:text-gray-400 text-sm font-normal">Configure your local runtime, paths, and server options.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleDiscard} className="flex items-center justify-center rounded-full h-10 px-6 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-text-main dark:text-white border border-slate-200 dark:border-transparent text-sm font-medium transition-all">
                                Discard
                            </button>
                            <button onClick={handleSave} className="flex items-center justify-center rounded-full h-10 px-6 bg-primary hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-[800px] mx-auto flex flex-col gap-8 pb-20">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-primary">terminal</span>
                                    <h3 className="text-text-main dark:text-white text-lg font-bold">Local Runtime</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-text-main dark:text-gray-200 text-sm font-semibold">Node.js Binary Path</span>
                                        <div className="flex w-full items-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary overflow-hidden transition-all">
                                            <input 
                                                className="w-full bg-transparent border-none text-text-main dark:text-white placeholder:text-text-sub h-12 px-4 focus:ring-0 text-sm font-mono" 
                                                type="text" 
                                                value={localNodePath}
                                                onChange={(e) => setLocalNodePath(e.target.value)}
                                            />
                                            <button className="h-12 px-4 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-sub dark:text-gray-400 border-l border-slate-200 dark:border-slate-800 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">folder_open</span>
                                            </button>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
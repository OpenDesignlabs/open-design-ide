import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

// ----------------------------------------------------------------------
// PHASE 13: THE "X-RAY" PLUGIN (Simulator)
// ----------------------------------------------------------------------
// In a real Vectra setup, a Vite plugin runs during 'npm run dev' to inject these IDs.
// For this prototype, we simulate that process during the scaffolding phase.
const simulateVitePluginInjection = (code: string, id: string) => {
    // Finds the first tag and injects data-vectra-id
    return code.replace(/<([a-zA-Z0-9]+)/, `<$1 data-vectra-id="${id}"`);
};

export const DashboardScreen: React.FC = () => {
    const navigate = useNavigate();
    const { projects, addProject, setCurrentProject } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Filter projects based on search
    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.tech.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3); // Show top 3

    const handleGenerate = () => {
        if (!prompt.trim()) {
            alert("Please describe your site first.");
            return;
        }
        setIsGenerating(true);
        
        // Simulating AI Scaffolding Phase
        setTimeout(() => {
            const safeTitle = prompt.substring(0, 20).replace(/[^a-zA-Z0-9 ]/g, "").trim() || "AI Project";
            
            // 1. Generate Clean Code (AI Output)
            const rawHeroCode = `
import React from 'react';

export const Hero = () => {
  return (
    <div className="w-full max-w-4xl bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-10">
      <h1 className="text-5xl font-bold text-white mb-6">Generated: ${safeTitle}</h1>
      <p className="text-xl text-indigo-200 mb-8">${prompt}</p>
      <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg">
        Get Started
      </button>
    </div>
  );
};`;

            // 2. Run "Vite Plugin" to inject IDs (X-Ray Phase)
            // We manually inject IDs into the raw string to match our Twin Engine expectations
            let instrumentedHeroCode = rawHeroCode;
            
            // This regex logic mimics the plugin walking the AST and tagging nodes
            // Inject ID for container (first div)
            instrumentedHeroCode = instrumentedHeroCode.replace(/<div/, '<div data-vectra-id="container"');
            // Inject ID for h1
            instrumentedHeroCode = instrumentedHeroCode.replace(/<h1/, '<h1 data-vectra-id="title"');
            // Inject ID for p
            instrumentedHeroCode = instrumentedHeroCode.replace(/<p/, '<p data-vectra-id="desc"');
            // Inject ID for button
            instrumentedHeroCode = instrumentedHeroCode.replace(/<button/, '<button data-vectra-id="button"');

            const newProjectFiles = {
                'package.json': `{\n  "name": "${safeTitle.toLowerCase().replace(/\s/g, "-")}",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}`,
                'App.tsx': `import React from 'react';\nimport { Hero } from './components/Hero';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <Hero />\n    </div>\n  );\n}`,
                'Hero.tsx': instrumentedHeroCode,
                'styles.css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  background-color: #0f172a;\n  color: white;\n}`
            };

            const newProject = {
                id: Date.now().toString(),
                title: safeTitle,
                tech: "React + Vite",
                path: `~/Dev/${safeTitle.replace(/\s/g, '')}`,
                lastUpdated: "Just now",
                active: true,
                color: "purple",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCALE7trep9wjThXBKEMSNaSzYefRhKYZTXsXxEo2cSJ-f3pd8u-e6Dy_9ZtfbUq4xl3wrmLfVseces4CHmTDrD3ve1GUUuPmll9uQJqWjkSDm8YT8GfpUl3WwHvlJCb2DUmZLy1Dl0A8TiaIqjb4TmYAVb9BcrfH8pAu94DMkJtDDzJhrPRQYBuZU8y3IUk5audIvG_fdslneTG5_OSs_7AqdsLmUrdfISLeW0cxoZ1nTjF5FgNxwqMpWj1fXS6U20tcPF98N0F1w",
                files: newProjectFiles,
                serverStatus: 'stopped' as const
            };

            addProject(newProject);
            setCurrentProject(newProject);
            setIsGenerating(false);
            navigate('/editor');
        }, 2000);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.fig, .sketch, .json';
        input.onchange = (e: any) => {
            if (e.target.files.length > 0) {
                const fileName = e.target.files[0].name;
                const newProject = {
                    id: Date.now().toString(),
                    title: fileName.split('.')[0] || "Imported Project",
                    tech: "HTML/CSS",
                    path: `~/Imports/${fileName}`,
                    lastUpdated: "Just now",
                    active: true,
                    color: "orange",
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPweZgydFKTocE6VU_0aHeg1QAVIdgdsS-c1QKlzZXS2Om2-age3RDAzsFOhh874CeIvCtI400BM-zxfKxu1vImRaYpCdlFT5Ukhzst4yrh_5w-9ggLwBoiaUFpNb0sop15ecqb5ZsHNs8btnEYStdJaTYYYYbfVN4y2vc7Pn4ThZSuamScN1Rot9CSbZc0YuumWQsxmGQqzpiW_hrD-iaghljWjeM_IdJiv8D9z6NLCyJ_7zPuTz-YL6IFG6qIWofcyAfQsImyuY",
                    files: {
                        'package.json': '{}',
                        'index.html': '<h1>Imported Design</h1>'
                    },
                    serverStatus: 'stopped' as const
                };
                addProject(newProject);
                setCurrentProject(newProject);
                navigate('/editor');
            }
        };
        input.click();
    };

    const handleOpenProject = (project: any) => {
        setCurrentProject(project);
        navigate('/editor');
    };

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex-shrink-0 transition-colors">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            {/* VECTRA LOGO */}
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2L2 7V17L12 22L22 17V7L12 2ZM7.5 9L12 16.5L16.5 9H13.5L12 12.5L10.5 9H7.5Z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-tight">Vectra</h1>
                            <p className="text-text-muted text-xs font-normal">v1.0.2 Local</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-full bg-primary text-white shadow-sm group">
                        <span className="material-symbols-outlined icon-fill">home</span>
                        <span className="text-sm font-bold">Home</span>
                    </Link>
                    <Link to="/projects" className="flex items-center gap-3 px-4 py-3 rounded-full text-text-main dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">schedule</span>
                        <span className="text-sm font-medium">Recent</span>
                    </Link>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-full text-text-main dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group" onClick={() => alert("Plugins marketplace connecting...")}>
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">extension</span>
                        <span className="text-sm font-medium">Plugins</span>
                    </button>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-full text-text-main dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                        <p className="px-4 text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">System</p>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-text-main dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">dns</span>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium">Local Server</span>
                                <span className="text-[10px] text-text-muted leading-none">Node v18.16.0</span>
                            </div>
                        </button>
                    </div>
                </nav>
                <div className="p-4 border-t border-border-light dark:border-border-dark">
                    <button className="flex items-center gap-3 w-full p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1ZFYudxaFnb75tnaTHnSClitZGjcw56R9Fex2pfImJduC1Kj5jhlJe2k_Efe10lClmB6ODE4VDFe5n2WSHy8ASjw01eQJ31CaTQMIMb9FnYjD6XJxLcUHcqwb6k0IH_czgXGoNq6FE6CgSJcGgNEz6t5W91g__EVCKERHH8oUEGF1ShuUD3S049jypvpgvRwwNnu-fVgG2EpwrW2TSYDnotA0_py6pBDEebJbEyWrjuJzTwAZZ0U9PZEoK3A8_8FU65W81ZeX7O4')"}}></div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold text-text-main dark:text-white">Alex Designer</span>
                            <span className="text-xs text-text-muted">Pro Plan</span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-text-muted text-[20px]">unfold_more</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                <header className="h-20 flex items-center justify-between px-6 py-4 flex-shrink-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                    <button className="md:hidden p-2 text-text-main dark:text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex-1 max-w-2xl mx-auto w-full px-4">
                        <label className="relative flex w-full items-center">
                            <span className="absolute left-4 text-text-muted material-symbols-outlined">search</span>
                            <input 
                                className="w-full bg-white dark:bg-surface-dark border-none rounded-xl h-12 pl-12 pr-4 text-text-main dark:text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:outline-none shadow-sm transition-all" 
                                placeholder="Search projects, commands, or documentation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute right-3 hidden sm:flex gap-1">
                                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-text-muted bg-background-light dark:bg-[#334155] rounded border border-border-light dark:border-border-dark">⌘K</kbd>
                            </div>
                        </label>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button className="p-2 text-text-main dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-black"></span>
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-4">
                    <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-10">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl md:text-4xl font-black text-text-main dark:text-white tracking-tight">Welcome back, Alex.</h2>
                            <p className="text-text-muted text-lg">Ready to build something amazing today?</p>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-light to-[#eff6ff] dark:from-surface-dark dark:to-[#0f172a] border border-border-light dark:border-border-dark shadow-sm p-1">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <span className="material-symbols-outlined text-[120px] text-primary rotate-12">auto_awesome</span>
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-4 p-6 md:p-8 items-start md:items-center">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-text-main dark:text-white icon-fill">auto_awesome</span>
                                            <h3 className="font-bold text-lg text-text-main dark:text-white">AI Architect</h3>
                                        </div>
                                        <div className="relative">
                                            <textarea 
                                                className="w-full bg-background-light dark:bg-[#020617] border border-border-light dark:border-border-dark rounded-lg p-4 pr-32 text-text-main dark:text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32 md:h-24 transition-shadow" 
                                                placeholder="Describe your site (e.g. 'A minimal portfolio for a photographer with a dark theme and masonry grid gallery')..."
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                            ></textarea>
                                            <button 
                                                onClick={handleGenerate}
                                                disabled={isGenerating}
                                                className={`absolute bottom-3 right-3 bg-primary hover:bg-[#2563eb] text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-transform shadow-lg shadow-primary/20 ${isGenerating ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                                                        <span>Scaffolding...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Generate</span>
                                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Link to="/canvas" className="flex flex-col items-start gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary/50 hover:shadow-md transition-all group text-left h-full">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">draw</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main dark:text-white">Prototyper</h3>
                                        <p className="text-sm text-text-muted mt-1">Start from scratch with a blank canvas.</p>
                                    </div>
                                </Link>
                                <Link to="/editor" className="flex flex-col items-start gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary/50 hover:shadow-md transition-all group text-left h-full">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">terminal</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main dark:text-white">Code Builder</h3>
                                        <p className="text-sm text-text-muted mt-1">Open local folder or git repository.</p>
                                    </div>
                                </Link>
                                <button onClick={handleImport} className="flex flex-col items-start gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary/50 hover:shadow-md transition-all group text-left h-full">
                                    <div className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">upload_file</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main dark:text-white">Import Design</h3>
                                        <p className="text-sm text-text-muted mt-1">Convert Figma design to code.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 pb-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-text-muted">history</span>
                                    Recent Projects
                                </h2>
                                <Link to="/projects" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">View All</Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-text-muted">No projects found. Try creating one!</div>
                                ) : (
                                    filteredProjects.map((project, i) => (
                                        <div key={i} className="group flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => handleOpenProject(project)}>
                                            <div className="h-40 w-full bg-cover bg-center relative" style={{backgroundImage: `url('${project.img}')`}}>
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">code</span>
                                                    <span>{project.tech}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-text-main dark:text-white truncate">{project.title}</h3>
                                                    <button className="text-text-muted hover:text-text-main dark:hover:text-white" onClick={(e) => { e.stopPropagation(); alert("Menu options"); }}>
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                                    <span className={`w-2 h-2 rounded-full bg-${project.color}-500`}></span>
                                                    <span>{project.lastUpdated}</span>
                                                    <span>•</span>
                                                    <span>main</span>
                                                </div>
                                                <div className="mt-2 flex gap-2">
                                                    <button className="flex-1 bg-background-light dark:bg-[#334155] hover:bg-primary/20 text-xs font-bold py-2 rounded-lg text-center text-text-main dark:text-gray-300 transition-colors" onClick={(e) => { e.stopPropagation(); handleOpenProject(project); }}>Open in Editor</button>
                                                    <button className="bg-background-light dark:bg-[#334155] hover:bg-primary/20 p-2 rounded-lg text-text-main dark:text-gray-300 transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/canvas'); }}>
                                                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
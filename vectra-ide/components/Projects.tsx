
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, Project } from '../AppContext';

export const ProjectManagerScreen: React.FC = () => {
    const navigate = useNavigate();
    const { projects, addProject, deleteProject, setCurrentProject } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewProject = () => {
        const name = prompt("Enter project name:");
        if (name) {
            const safeTitle = name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
            const newProject: Project = {
                id: Date.now().toString(),
                title: safeTitle,
                tech: "Vite/React",
                path: `~/Dev/${safeTitle.replace(/\s+/g, '')}`,
                lastUpdated: "Just now",
                active: true,
                color: "blue",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYyg2rMYtb_OCjiRmMha7HuLGSDYaALEqynUnQCbPmW2KnK222NS2z6ZDHrlwtV3lFw6yxdwyzBsCL6lhkqRIIl8FU5DnRiygBynJ0faVhKgxGyzFGFHXX_J1xuJ_QhQjgOV-gIXlx1Wz7mTZLs8NAA8zg8Gfy0O7bxgs0jyoAJdNXrus_LzzOf7fsyMuId25d5EPwnbH-EwzubcqLTcF_TyLKqcxdHtP4mmCxW5X-c78u9tAPZevUlw5TN8LIhVlG0q0DTDiEDl0",
                files: {
                    'package.json': '{}',
                    'App.tsx': `import React from 'react';\nexport default function App() { return <h1>${safeTitle}</h1> }`
                },
                serverStatus: 'stopped'
            };
            addProject(newProject);
            setCurrentProject(newProject);
            navigate('/editor');
        }
    };

    const handleProjectClick = (project: Project) => {
        setCurrentProject(project);
        navigate('/editor');
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this project?")) {
            deleteProject(id);
            setActiveMenu(null);
        }
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#0f172a] dark:text-gray-100 font-display overflow-hidden h-screen w-full flex selection:bg-primary/30" onClick={() => setActiveMenu(null)}>
            <aside className="w-20 bg-white dark:bg-[#1e293b] border-r border-[#e2e8f0] dark:border-[#334155] flex flex-col items-center py-6 gap-6 z-20 shrink-0">
                <Link to="/" className="size-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105">
                    {/* VECTRA LOGO */}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2L2 7V17L12 22L22 17V7L12 2ZM7.5 9L12 16.5L16.5 9H13.5L12 12.5L10.5 9H7.5Z" />
                    </svg>
                </Link>
                <nav className="flex flex-col gap-3 w-full px-4 items-center">
                    <button className="sidebar-icon-btn bg-[#eff6ff] dark:bg-[#1e293b] text-primary dark:text-primary shadow-sm w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200" title="Projects">
                        <span className="material-symbols-outlined">folder_open</span>
                    </button>
                    <button className="sidebar-icon-btn w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]" title="Templates">
                        <span className="material-symbols-outlined">dashboard</span>
                    </button>
                </nav>
                <div className="mt-auto flex flex-col gap-3 w-full px-4 items-center">
                    <Link to="/settings" className="sidebar-icon-btn w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]" title="Settings">
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                    <div className="h-10 w-10 rounded-full bg-cover bg-center border border-[#e2e8f0] dark:border-[#334155]" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKpGZv1QZSwONwMEWexkrjZ98UeI3ysA3tRI3HJyn3JhT80OFioYKGbFO_5NKlg3eI_pyIPQ-mKMyv63E8Ht3o9n4ywNDldnZ7SC1IzIvdg-etVmToJAiNPYAZjlD3t4SpQhC3uyzhGjC1ZRl9jlR0TBDfw3pIDz_eb8QtloOCToMsbYl57GQNLLC47_-wzC5Ty1qjSoodJkzw-I0w-p4bhm-nrGi2Ure-SWnFBF3QzoIBb_Dimtsf6sT8gklPUnWLFnWy1ShOV6k')"}}></div>
                </div>
            </aside>
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
                <header className="px-8 pt-8 pb-4 flex flex-col gap-6 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#0f172a] dark:text-white">Local Projects</h1>
                            <p className="text-[#64748b] dark:text-[#94a3b8] text-base font-normal">Manage your locally stored builds.</p>
                        </div>
                        <button onClick={handleNewProject} className="flex items-center gap-2 bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] hover:bg-opacity-90 px-5 py-2.5 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-lg">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>New Project</span>
                        </button>
                    </div>
                    <div className="relative w-full max-w-lg group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-[#64748b] dark:text-[#94a3b8]">search</span>
                        </div>
                        <input 
                            className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1e293b] border-0 rounded-2xl text-[#0f172a] dark:text-white placeholder-[#94a3b8] dark:placeholder-[#64748b] focus:ring-2 focus:ring-primary focus:outline-none shadow-sm transition-all" 
                            placeholder="Search projects or file paths..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
                    <h3 className="text-sm font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider mb-4">Recent</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {filteredProjects.length === 0 ? (
                             <div className="col-span-full flex flex-col items-center justify-center h-[50vh] text-center text-text-muted">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">folder_off</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">No projects found</h3>
                                <p className="max-w-md text-sm mb-8">
                                    {searchQuery 
                                        ? `We couldn't find any projects matching "${searchQuery}".` 
                                        : "You haven't created any projects yet. Start building your next big idea."}
                                </p>
                                <button onClick={handleNewProject} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Create New Project
                                </button>
                             </div>
                        ) : filteredProjects.map((project, i) => (
                            <div key={i} onClick={() => handleProjectClick(project)} className="group relative bg-white dark:bg-[#1e293b] rounded-2xl p-3 shadow-[0_0_0_2px_transparent] hover:shadow-[0_0_0_2px_#3b82f6] cursor-pointer transition-all">
                                <div className="aspect-video w-full rounded-xl bg-gray-100 dark:bg-[#334155] overflow-hidden relative mb-3">
                                    {project.active && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                            ACTIVE
                                        </div>
                                    )}
                                    <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: `url('${project.img}')`}}></div>
                                </div>
                                <div className="px-1 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#0f172a] dark:text-white leading-tight">{project.title}</h3>
                                            <div className="flex items-center gap-1 text-[#64748b] dark:text-[#94a3b8] text-xs mt-1 font-mono">
                                                <span className="material-symbols-outlined text-[14px]">folder</span>
                                                {project.path}
                                            </div>
                                        </div>
                                        <button 
                                            className="text-text-muted hover:text-text-main dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                            onClick={(e) => toggleMenu(e, project.id)}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                        
                                        {activeMenu === project.id && (
                                            <div className="absolute right-0 top-8 bg-white dark:bg-[#0f172a] shadow-xl rounded-lg border border-border-light dark:border-border-dark py-1 z-50 w-32 animate-fade-in text-left">
                                                <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/5 text-text-main dark:text-white">Rename</button>
                                                <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/5 text-text-main dark:text-white">Duplicate</button>
                                                <div className="h-px bg-border-light dark:bg-border-dark my-1"></div>
                                                <button 
                                                    className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                                    onClick={(e) => handleDelete(e, project.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <aside className="w-[400px] bg-white dark:bg-[#1e293b] border-l border-[#e2e8f0] dark:border-[#334155] flex flex-col shrink-0 z-10 shadow-xl hidden xl:flex">
                <div className="p-6 pb-4 border-b border-[#f1f5f9] dark:border-[#334155]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-lg bg-gray-100 dark:bg-[#334155] bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAl9TsA8135jNqHxC6V57tv6nL5c_0hAxWQZLJpDQdt5vQLPoClE7mZCRN59R2aUyAC741pUROrTAXwWwNldIcEVu2z7umzIq-8wAOF-yuyuKuvEshYzxriE1n8R5prgfrc_CvQ73upiNXL8axBjQjUuEG-AroNof0d89BUEY0VE39prdBzMaKevSoAldPXbkNh5AJluy0XkMKTWoB17TCnP0_uAG03LKiNR0O6hiJcqyZhf1gUONYwmLDNJnY3vxwHZO-FEYhxcLs')"}}></div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">Project Alpha</h2>
                            <div className="flex items-center gap-1.5 text-xs text-[#64748b] dark:text-[#94a3b8]">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-medium">Running on localhost:3000</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <Link to="/editor" className="w-full h-14 bg-primary text-white rounded-full flex items-center justify-center gap-2 font-bold text-base shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none">
                            <span className="material-symbols-outlined">play_arrow</span>
                            Open Editor
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2 flex-1 min-h-[200px]">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-[#0f172a] dark:text-white">Terminal Output</h3>
                        </div>
                        <div className="bg-[#0f172a] dark:bg-[#020617] rounded-xl p-4 font-mono text-xs leading-relaxed text-[#e2e8f0] flex-1 overflow-y-auto shadow-inner border border-gray-800">
                            <div className="flex flex-col gap-1">
                                <p className="text-green-400">$ npm run dev</p>
                                <p className="opacity-70">&gt; project-alpha@0.0.1 dev</p>
                                <p className="opacity-70">&gt; vite</p>
                                <br/>
                                <p className="text-blue-400">  VITE v4.4.9  <span className="text-[#64748b]">ready in 340 ms</span></p>
                                <br/>
                                <p className="flex items-center gap-2">
                                    <span className="text-green-400">➜</span>
                                    <span className="font-bold">Local:</span>
                                    <span className="text-blue-400 underline decoration-blue-400/30">http://localhost:3000/</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

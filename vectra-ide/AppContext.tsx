import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Project {
    id: string;
    title: string;
    tech: string;
    path: string;
    lastUpdated: string;
    active: boolean;
    color: string;
    img: string;
    files: Record<string, string>; // Virtual File System
    serverStatus: 'stopped' | 'starting' | 'running';
}

interface AppSettings {
    nodePath: string;
    theme: 'light' | 'dark';
}

interface AppContextType {
    projects: Project[];
    addProject: (project: Project) => void;
    deleteProject: (id: string) => void;
    settings: AppSettings;
    updateSettings: (settings: Partial<AppSettings>) => void;
    currentProject: Project | null;
    setCurrentProject: (project: Project) => void;
    updateProjectFile: (projectId: string, fileName: string, newContent: string) => void;
    setServerStatus: (projectId: string, status: 'stopped' | 'starting' | 'running') => void;
    updateElement: (projectId: string, fileName: string, elementId: string, updates: { className?: string, content?: string }) => void;
}

// ----------------------------------------------------------------------
// PHASE 13: THE "X-RAY" CONNECTOR (Simulated)
// ----------------------------------------------------------------------
// The default files now come pre-instrumented with IDs, simulating what the Vite plugin does.
const defaultFiles = {
    'package.json': `{\n  "name": "fintech-dashboard",\n  "version": "0.0.1",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}`,
    'App.tsx': `import React from 'react';\nimport { Hero } from './components/Hero';\n\nexport default function App() {\n  return (\n    <div className="app-container">\n      <Hero />\n    </div>\n  );\n}`,
    'Hero.tsx': `import React from 'react';\n\nexport const Hero = () => {\n  return (\n    <div data-vectra-id="container" className="w-full max-w-4xl bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-12">\n      <h1 data-vectra-id="title" className="text-5xl font-bold text-white mb-6">Build Faster with AI</h1>\n      <p data-vectra-id="desc" className="text-xl text-indigo-200 mb-8">Create stunning websites in minutes, not days.</p>\n      <button data-vectra-id="button" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg">\n        Get Started\n      </button>\n    </div>\n  );\n};`,
    'styles.css': `.app-container {\n  width: 100%;\n  min-height: 100vh;\n  background: #0f172a;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`
};

// ----------------------------------------------------------------------
// PHASE 14: THE AST SURGEON (Node.js Logic Simulation)
// ----------------------------------------------------------------------
// Robust regex-based parser to simulate AST modification in Node.js
const astSurgeon = (code: string, elementId: string, updates: { className?: string, content?: string }) => {
    // 1. Locate the opening tag. We use [\s\S] to match newlines in props.
    const tagRegex = new RegExp(`<([a-zA-Z0-9]+)[^>]*data-vectra-id="${elementId}"[\\s\\S]*?>`, 'i');
    const match = code.match(tagRegex);
    
    if (!match) return code; 
    
    let originalTag = match[0];
    let modifiedTag = originalTag;
    const tagName = match[1];

    // 2. Surgical Update: className
    if (updates.className !== undefined) {
        if (originalTag.match(/className="[^"]*"/)) {
            // Replace existing className
            modifiedTag = modifiedTag.replace(/className="([^"]*)"/, `className="${updates.className}"`);
        } else {
            // Inject className before the closing bracket of the opening tag
            // Handle self-closing tags '/>' and normal tags '>'
            if (modifiedTag.endsWith('/>')) {
                modifiedTag = modifiedTag.replace(/\/>$/, ` className="${updates.className}" />`);
            } else {
                modifiedTag = modifiedTag.replace(/>$/, ` className="${updates.className}">`);
            }
        }
    }

    let newCode = code.replace(originalTag, modifiedTag);

    // 3. Surgical Update: Content
    if (updates.content !== undefined) {
        // This is tricky with regex for nested tags, but for our prototype structure it works.
        // We look for: <Tag ...id="X"...> CONTENT </Tag>
        // We escape the tag name for the closing tag regex
        const contentRegex = new RegExp(`(<${tagName}[^>]*data-vectra-id="${elementId}"[^>]*>)([\\s\\S]*?)(<\/${tagName}>)`, 'i');
        
        newCode = newCode.replace(contentRegex, (fullMatch, openTag, innerContent, closeTag) => {
            return `${openTag}${updates.content}${closeTag}`;
        });
    }

    return newCode;
};

const defaultProjects: Project[] = [
    { 
        id: '1', 
        title: "Fintech Dashboard v2", 
        tech: "React", 
        path: "~/Dev/Fintech", 
        lastUpdated: "2m ago", 
        active: true, 
        color: "green", 
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuByQ8MdYpHrJB-RXnxJ9fcq0JAyAdprnTk8QrLdzuQzK43_4YqvLAAOvsIQ2Lh9XoiLxR4JtzALFZjIvj9AhRyKETqZpFWaTnF5UnjXKA82dhEiiF14DfOjNn2tkeJAaNRzGYVzSroizr2z8-SbYfyBYu_SYobwRkPnrsbnmSo7R-okKERK03FUiqXT_qRBkA2HiZMiL90F7b8bUeznPHxs1nmB60uv0Uk1f8LNvb5_rUTZqF3On0RUPoASjuOGQ0-FmgfeiWvdNAc",
        files: defaultFiles,
        serverStatus: 'running'
    },
    { 
        id: '2', 
        title: "Personal Portfolio", 
        tech: "Vue", 
        path: "~/Dev/Portfolio", 
        lastUpdated: "1h ago", 
        active: false, 
        color: "gray", 
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_ak7sjwxbr5oqAt9-C_gSJHnUT0s1QwvOzY6NGVY4M9ejEfB9otTNVZsGwt_0r697ii1Oevj7uQoozOwqDvkrNUL0oKbJsva6I0IbiPxwkLKvSq2rX9En5kUlrt3Xj65ieGVjnLCnRuB8PR2zzONUdeF2iEm1i37BZ6KERX-ueYcp4BidpQB6Nug1AIaSakmjh5yFAr3PHaANK4Q7_c_1Y9J0IUOaReec4AhLJCnPbMvIDNFNWzNImUZTbhvSqX4EghlPjP-Sg10",
        files: { ...defaultFiles, 'Hero.tsx': `// Portfolio Hero\nexport const Hero = () => <div>My Portfolio</div>;` },
        serverStatus: 'stopped'
    },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(defaultProjects);
    const [settings, setSettings] = useState<AppSettings>({ nodePath: '/usr/local/bin/node', theme: 'light' });
    const [currentProject, setCurrentProjectState] = useState<Project | null>(defaultProjects[0]);

    const addProject = (project: Project) => {
        setProjects(prev => [project, ...prev]);
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (currentProject && currentProject.id === id) {
            const remaining = projects.filter(p => p.id !== id);
            setCurrentProjectState(remaining.length > 0 ? remaining[0] : null);
        }
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const setCurrentProject = (project: Project) => {
        const freshProject = projects.find(p => p.id === project.id) || project;
        const updatedProjects = projects.map(p => ({
            ...p,
            active: p.id === freshProject.id
        }));
        setProjects(updatedProjects);
        setCurrentProjectState(freshProject);
    };

    const updateProjectFile = (projectId: string, fileName: string, newContent: string) => {
        setProjects(prevProjects => {
            const updated = prevProjects.map(p => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        files: { ...p.files, [fileName]: newContent }
                    };
                }
                return p;
            });
            if (currentProject?.id === projectId) {
                const updatedCurrent = updated.find(p => p.id === projectId)!;
                setCurrentProjectState(updatedCurrent);
            }
            return updated;
        });
    };

    const setServerStatus = (projectId: string, status: 'stopped' | 'starting' | 'running') => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, serverStatus: status } : p));
        if (currentProject?.id === projectId) {
            setCurrentProjectState(prev => prev ? { ...prev, serverStatus: status } : null);
        }
    };

    // The Bridge between Drag and Code
    const updateElement = (projectId: string, fileName: string, elementId: string, updates: { className?: string, content?: string }) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const currentCode = project.files[fileName];
        if (!currentCode) return;

        const newCode = astSurgeon(currentCode, elementId, updates);
        
        // Optimistic update for UI responsiveness
        updateProjectFile(projectId, fileName, newCode);
    };

    return (
        <AppContext.Provider value={{ 
            projects, 
            addProject, 
            deleteProject, 
            settings, 
            updateSettings, 
            currentProject, 
            setCurrentProject,
            updateProjectFile,
            setServerStatus,
            updateElement 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};
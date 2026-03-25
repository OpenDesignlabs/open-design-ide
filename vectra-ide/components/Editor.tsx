
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';

// Reusing the robust regex logic from Canvas to ensure "Twin Engine" consistency
const extractProps = (code: string, id: string) => {
    const tagRegex = new RegExp(`<[^>]*data-vectra-id="${id}"[^>]*>`, 'i');
    const match = code.match(tagRegex);
    if (!match) return { className: '', content: '' };

    const classMatch = match[0].match(/className="([^"]*)"/);
    const className = classMatch ? classMatch[1] : '';

    const contentRegex = new RegExp(`data-vectra-id="${id}"[^>]*>([\\s\\S]*?)<\\/[a-zA-Z0-9]+>`, 'i');
    const contentMatch = code.match(contentRegex);
    const content = contentMatch ? contentMatch[1].trim() : '';

    return { className, content };
};

interface Problem {
    line: number;
    message: string;
    severity: 'error' | 'warning';
    token: string;
}

export const EditorScreen: React.FC = () => {
    const { currentProject, updateProjectFile, setServerStatus } = useApp();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeFile, setActiveFile] = useState<string>('Hero.tsx');
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [activeTab, setActiveTab] = useState<'problems' | 'output' | 'terminal'>('terminal');

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLPreElement>(null);
    
    useEffect(() => {
        if (currentProject && !currentProject.files[activeFile]) {
            const firstFile = Object.keys(currentProject.files)[0];
            if (firstFile) setActiveFile(firstFile);
        }
    }, [currentProject]);

    useEffect(() => {
        if (!currentProject) return;

        if (currentProject.serverStatus === 'starting') {
            setTerminalLogs([
                "$ npm run dev",
                "> vite",
                "  > Local: http://localhost:3000/",
                "  > Network: use --host to expose",
                "  ready in 340ms."
            ]);
            setTimeout(() => setServerStatus(currentProject.id, 'running'), 500);
        } else if (currentProject.serverStatus === 'stopped') {
            setTerminalLogs(prev => [...prev, "", "Server stopped."]);
        }
    }, [currentProject?.serverStatus]);

    const activeCode = currentProject?.files[activeFile] || "";

    // --- MOCK LINTER ---
    useEffect(() => {
        const newProblems: Problem[] = [];
        const lines = activeCode.split('\n');
        
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // Rule 1: React uses className, not class
            if (line.includes('class=') && !line.includes('className=')) {
                newProblems.push({
                    line: lineNum,
                    message: "Did you mean 'className'?",
                    severity: 'error',
                    token: 'class='
                });
            }
            
            // Rule 2: Image alt tags
            if (line.includes('<img') && !line.includes('alt=')) {
                newProblems.push({
                    line: lineNum,
                    message: "Image elements must have an alt prop.",
                    severity: 'warning',
                    token: '<img'
                });
            }

            // Rule 3: Specific typo from prompt context
            if (line.includes('handleStrt')) {
                newProblems.push({
                    line: lineNum,
                    message: "Possible typo: 'handleStrt'. Did you mean 'handleStart'?",
                    severity: 'error',
                    token: 'handleStrt'
                });
            }
        });

        setProblems(newProblems);
    }, [activeCode]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleRun = () => {
        if (!currentProject) return;
        
        if (currentProject.serverStatus === 'running') {
            setServerStatus(currentProject.id, 'stopped');
        } else {
            setServerStatus(currentProject.id, 'starting');
            setActiveTab('terminal');
        }
    };

    const handlePublish = () => {
        const confirmPublish = confirm(`Publish ${currentProject?.title || "Project"} to production?`);
        if (confirmPublish) {
            setTerminalLogs(prev => [...prev, "", "> Deploying to Vercel...", "  ✓ Production build created", "  ✓ Deployed: https://vectra-app.vercel.app"]);
            setActiveTab('terminal');
        }
    };

    const handleCodeChange = (newCode: string) => {
        if (currentProject) {
            updateProjectFile(currentProject.id, activeFile, newCode);
        }
    };

    const handleScroll = () => {
        if (textareaRef.current && overlayRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
            overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Live Preview Rendering Logic
    const heroCode = currentProject?.files['Hero.tsx'] || "";
    const containerProps = extractProps(heroCode, 'container');
    const titleProps = extractProps(heroCode, 'title');
    const buttonProps = extractProps(heroCode, 'button');
    const descProps = extractProps(heroCode, 'desc');

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <nav className="h-12 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] flex items-center justify-between px-3 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 mr-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2L2 7V17L12 22L22 17V7L12 2ZM7.5 9L12 16.5L16.5 9H13.5L12 12.5L10.5 9H7.5Z" />
                            </svg>
                        </div>
                        <span className="font-bold text-sm tracking-tight hidden md:block">Vectra</span>
                    </Link>
                    <div className="hidden lg:flex items-center text-[13px] text-slate-600 dark:text-slate-400">
                        {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(item => (
                            <button key={item} className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">{item}</button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 mr-2 hidden sm:block">
                        {currentProject?.title || "No Project"}
                    </span>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded border border-slate-200 dark:border-slate-700 h-8">
                        <button onClick={toggleSidebar} className={`w-6 h-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-sm transition-all ${!isSidebarOpen ? 'text-primary' : ''}`} title="Toggle Sidebar">
                            <span className="material-symbols-outlined text-base">vertical_split</span>
                        </button>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
                        <div className="flex items-center text-xs px-2 gap-1.5 text-slate-600 dark:text-slate-300 font-mono">
                            <span className={`material-symbols-outlined text-sm ${activeFile.endsWith('tsx') ? 'text-blue-400' : 'text-yellow-400'}`}>description</span>
                            <span>{activeFile}</span>
                        </div>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
                        <button onClick={handleRun} className={`w-6 h-6 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-700 text-blue-500 hover:text-blue-600 shadow-sm transition-all ${currentProject?.serverStatus === 'starting' ? 'animate-pulse' : ''}`} title={currentProject?.serverStatus === 'running' ? "Stop Server" : "Run Server"}>
                            <span className="material-symbols-outlined text-lg">{currentProject?.serverStatus === 'running' ? 'stop' : 'play_arrow'}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-slate-700 pl-3 h-6">
                        <button onClick={handlePublish} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors shadow-sm shadow-blue-500/20 active:scale-95 transform">
                            <span className="material-icons-round text-sm">rocket_launch</span>
                            Publish
                        </button>
                        <button className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white dark:ring-slate-700 overflow-hidden ml-1">
                            <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCySVyzJqPik_SKldnmFKG1pB32OsaN_dcmR1Aiuy6gccT9FH7FGUv_FCDxCI9NslXx-hQWWy_IwNR78IrS_Tj44usBgZFjoMTzwhPU0IFkjvbhAQNYnOhq6sFVpVQzcPLycbCylhjkmO0-xL38u15a0sUfgor-0eGvepAJLI08r563TftKqqn3xWQW_yWHV8AZ7ngdmLi71KX-5l42tm4a2DADBku93dt5qX1Z-HgdR6lUnJStqmutpHHs-dW8OavKcgj0w7qmwdo"/>
                        </button>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-12 bg-slate-50 dark:bg-[#18181b] border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-3 gap-3 shrink-0 z-10">
                    <button className="w-12 h-10 border-l-2 border-primary flex items-center justify-center text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined text-2xl">folder_copy</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-2xl">search</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-2xl">source</span>
                    </button>
                </aside>
                {isSidebarOpen && (
                    <aside className="w-64 bg-slate-50 dark:bg-[#18181b] border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 animate-fade-in-right">
                        <div className="h-9 px-4 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100/50 dark:bg-slate-800/30">
                            <span>Explorer</span>
                            <span className="material-icons-round text-sm cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" title="New File" onClick={() => alert("New File created (Mock)")}>add</span>
                        </div>
                        <div className="flex-1 overflow-y-auto px-0 py-1">
                            <div className="space-y-0 text-[13px] font-medium font-sans select-none">
                                <div className="flex items-center gap-1 px-3 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a2d2e] cursor-pointer group">
                                    <span className="material-icons-round text-lg text-slate-400 rotate-90 transition-transform group-hover:text-slate-500">chevron_right</span>
                                    <span className="font-bold text-xs uppercase tracking-wide truncate max-w-[150px]">{currentProject?.title || "PROJECT"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 ml-9 pl-0">
                                        {currentProject && Object.keys(currentProject.files).map(fileName => (
                                            <div 
                                                key={fileName}
                                                className={`flex items-center gap-1.5 px-3 py-1 cursor-pointer ${activeFile === fileName ? 'bg-blue-100/50 dark:bg-[#37373d] text-blue-700 dark:text-white relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-0.5 after:bg-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}
                                                onClick={() => setActiveFile(fileName)}
                                            >
                                                <span className="material-symbols-outlined text-base text-blue-500">
                                                    {fileName.endsWith('json') ? 'data_object' : fileName.endsWith('css') ? 'css' : 'code'}
                                                </span>
                                                <span>{fileName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
                <main className="flex-1 flex min-w-0 bg-background-light dark:bg-[#0d0d0d] relative overflow-hidden">
                     {/* The Execution Engine (Browser Preview) */}
                    <div className="flex-1 flex flex-col min-w-[300px] border-r border-slate-300 dark:border-slate-800 relative group">
                        <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f22] flex items-center justify-between px-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${currentProject?.serverStatus === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span> Localhost:3000</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100 dark:bg-[#0d0d0d] relative overflow-auto flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                            {currentProject?.serverStatus === 'running' ? (
                                <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden relative border border-gray-200 flex flex-col">
                                    <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="flex-1 bg-white mx-4 rounded text-[10px] px-2 py-0.5 text-gray-500 text-center shadow-sm">localhost:3000</div>
                                    </div>
                                    
                                    {/* HOT RELOAD PREVIEW using Source IDs */}
                                    <div className="w-full h-full p-8 overflow-auto flex flex-col items-center">
                                        <div className={containerProps.className}>
                                            <h1 className={titleProps.className}>{titleProps.content}</h1>
                                            <p className={descProps.className}>{descProps.content}</p>
                                            <button className={buttonProps.className}>{buttonProps.content}</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">dns</span>
                                    <h3 className="text-slate-500 font-bold">Server is stopped</h3>
                                    <button onClick={handleRun} className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors">Start Server</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-[50%] min-w-[400px] flex flex-col bg-[#1e1e1e] border-l border-[#333]">
                        <div className="flex bg-[#1e1e1e] border-b border-[#252526] overflow-x-auto no-scrollbar">
                            {currentProject && Object.keys(currentProject.files).map(fileName => (
                                <div 
                                    key={fileName}
                                    className={`flex items-center gap-2 px-3 py-2 border-t-2 text-xs font-sans cursor-pointer min-w-[100px] border-r border-[#252526] ${activeFile === fileName ? 'bg-[#1e1e1e] border-blue-500 text-white' : 'bg-[#2d2d2d] border-transparent text-[#969696]'}`}
                                    onClick={() => setActiveFile(fileName)}
                                >
                                    <span>{fileName}</span>
                                    {activeFile === fileName && <span className="material-icons-round text-sm hover:bg-[#333] rounded-md p-0.5 text-slate-400 absolute right-2 cursor-pointer">close</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 flex relative overflow-hidden bg-[#1e1e1e]">
                            {/* Gutter */}
                            <div className="w-14 flex flex-col items-end pt-2 bg-[#1e1e1e] font-mono text-[13px] leading-6 select-none border-r border-[#2b2b2b] z-10">
                                {activeCode.split('\n').map((_, i) => {
                                    const lineNum = i + 1;
                                    const hasError = problems.some(p => p.line === lineNum && p.severity === 'error');
                                    return (
                                        <div key={i} className={`gutter-num w-full text-right pr-3 ${hasError ? 'text-red-500 font-bold bg-red-900/10' : (i + 1) % 10 === 0 ? 'text-slate-400' : 'text-[#858585]'}`}>
                                            {lineNum}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Editor Container */}
                            <div className="relative flex-1 h-full font-mono text-[13px] leading-6">
                                {/* Editor Overlay for Error Squiggles */}
                                <pre
                                    ref={overlayRef}
                                    className="absolute inset-0 w-full h-full m-0 p-2 pl-4 pointer-events-none text-transparent z-0 overflow-hidden whitespace-pre-wrap break-all"
                                    aria-hidden="true"
                                >
                                    {activeCode.split('\n').map((line, i) => {
                                        const lineProblems = problems.filter(p => p.line === i + 1);
                                        if (lineProblems.length > 0) {
                                            let processedLine = [];
                                            let cursor = 0;
                                            lineProblems.forEach(problem => {
                                                const tokenIndex = line.indexOf(problem.token, cursor);
                                                if (tokenIndex !== -1) {
                                                    processedLine.push(line.substring(cursor, tokenIndex));
                                                    processedLine.push(
                                                        <span key={`${i}-${tokenIndex}`} className="error-squiggly decoration-red-500 text-transparent">
                                                            {problem.token}
                                                        </span>
                                                    );
                                                    cursor = tokenIndex + problem.token.length;
                                                }
                                            });
                                            processedLine.push(line.substring(cursor));
                                            return <div key={i}>{processedLine}</div>;
                                        }
                                        return <div key={i}>{line || ' '}</div>;
                                    })}
                                </pre>

                                <textarea 
                                    ref={textareaRef}
                                    className="absolute inset-0 w-full h-full bg-transparent text-[#d4d4d4] p-2 pl-4 border-none resize-none focus:ring-0 focus:outline-none z-10 whitespace-pre-wrap break-all"
                                    spellCheck={false}
                                    value={activeCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    onScroll={handleScroll}
                                />
                            </div>
                        </div>
                        <div className="h-40 border-t border-[#333] bg-[#1e1e1e] flex flex-col shrink-0">
                            <div className="flex items-center px-4 h-8 gap-6 border-b border-[#252526] text-[11px] font-bold text-slate-500 select-none">
                                <span 
                                    className={`cursor-pointer ${activeTab === 'problems' ? 'text-slate-200 border-b border-blue-500' : 'hover:text-slate-300'}`}
                                    onClick={() => setActiveTab('problems')}
                                >
                                    PROBLEMS <span className={`ml-1 px-1.5 py-0.5 rounded-full ${problems.length > 0 ? 'bg-red-900/50 text-red-400' : 'bg-[#333]'}`}>{problems.length}</span>
                                </span>
                                <span className={`cursor-pointer ${activeTab === 'output' ? 'text-slate-200 border-b border-blue-500' : 'hover:text-slate-300'}`} onClick={() => setActiveTab('output')}>OUTPUT</span>
                                <span className={`cursor-pointer ${activeTab === 'terminal' ? 'text-slate-200 border-b border-blue-500' : 'hover:text-slate-300'}`} onClick={() => setActiveTab('terminal')}>TERMINAL</span>
                            </div>
                            <div className="flex-1 p-2 font-mono text-xs overflow-y-auto">
                                {activeTab === 'terminal' && (
                                    <>
                                        {terminalLogs.map((log, index) => (
                                            <div key={index} className="mb-0.5 text-slate-300">
                                                {log.startsWith('$') ? <span className="text-green-400">{log}</span> : log}
                                            </div>
                                        ))}
                                        {terminalLogs.length === 0 && <span className="text-gray-600 italic">Ready.</span>}
                                    </>
                                )}
                                {activeTab === 'problems' && (
                                    <div className="flex flex-col gap-1">
                                        {problems.length === 0 ? (
                                            <span className="text-gray-500 italic">No problems detected.</span>
                                        ) : (
                                            problems.map((prob, i) => (
                                                <div key={i} className="flex gap-2 items-start cursor-pointer hover:bg-[#2d2d2d] p-1 rounded">
                                                    <span className={`material-symbols-outlined text-sm ${prob.severity === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                        {prob.severity === 'error' ? 'error' : 'warning'}
                                                    </span>
                                                    <span className="text-slate-400">[{activeFile}:{prob.line}]</span>
                                                    <span className="text-slate-300">{prob.message}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

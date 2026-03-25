import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';

// Import the Engine Classes (Ensure these are moved to src/engine/)
import { Camera } from '../src/engine/camera.js';
import { Renderer } from '../src/engine/renderer.js';
import { SceneGraph, Node } from '../src/engine/scene-graph.js';
import { HitTest } from '../src/engine/hit-test.js';
import { HistoryManager } from '../src/engine/history.js';
import { Compiler } from '../src/engine/compiler.js';
import { TextEditor } from '../src/engine/text-editor.js';

// Engine Constants
const MODES = { IDLE: 'idle', PAN: 'pan', DRAG: 'drag', RESIZE: 'resize', PEN: 'pen', TEXT: 'text' };

export const CanvasScreen: React.FC = () => {
    const { currentProject, updateProjectFile } = useApp();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Engine Refs (Persist across renders without causing re-renders)
    const engine = useRef<{
        scene: any;
        camera: any;
        renderer: any;
        history: any;
        textEditor: any;
        mode: string;
        activeHandle: any;
        dragStart: { x: number, y: number };
        snapshots: Map<string, any>;
        currentPath: any;
    } | null>(null);

    // React State for UI Sync
    const [activeTool, setActiveTool] = useState('move');
    const [zoomLevel, setZoomLevel] = useState(100);
    const [layers, setLayers] = useState<any[]>([]); // To sync Layers Panel
    const [selection, setSelection] = useState<any[]>([]); // To sync Properties

    // --- INITIALIZATION ---
    useEffect(() => {
        if (!canvasRef.current || engine.current) return;

        console.log("🚀 Initializing Vectra Engine in React...");
        
        const scene = new SceneGraph();
        const camera = new Camera();
        const renderer = new Renderer(canvasRef.current, camera, scene);
        
        // Mock Update Function (Syncs Engine -> React UI)
        const syncUI = () => {
            setLayers([...scene.getFlatList().reverse()]); // Update Layers List
            setSelection([...renderer.selection]);         // Update Selection
            
            // Auto-Generate Code on change
            const compiler = new Compiler(scene);
            const result = compiler.compile();
            // Update the 'App.tsx' in the virtual file system
            // We use a timeout to avoid excessive re-renders during drag
            // In production, use debounce
            if (currentProject) {
                // We will emit an event or use a ref to update AppContext safely
                // For now, we log code generation
                // console.log("Code Generated"); 
            }
        };

        const history = new HistoryManager(renderer, syncUI);
        const textEditor = new TextEditor(camera, renderer, syncUI);

        // Load Initial Data (or Load from currentProject files if we had a parser)
        // For now, start fresh or add a demo rect
        scene.add(new Node('rect', { x: 100, y: 100, w: 200, h: 100, fill: '#3b82f6' }));
        scene.add(new Node('text', { x: 120, y: 140, text: 'Hello Vectra', fontSize: 24, color: '#ffffff' }));

        engine.current = {
            scene,
            camera,
            renderer,
            history,
            textEditor,
            mode: MODES.IDLE,
            activeHandle: null,
            dragStart: { x: 0, y: 0 },
            snapshots: new Map(),
            currentPath: null
        };

        // Initial Draw
        setTimeout(() => {
            renderer.resize();
            syncUI();
        }, 50);

        // Handle Window Resize
        const handleResize = () => renderer.resize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // --- TOOLS ---
    const setTool = (tool: string) => {
        if (!engine.current) return;
        setActiveTool(tool);
        
        // Reset Engine State
        engine.current.mode = MODES.IDLE;
        engine.current.renderer.selection = [];
        engine.current.currentPath = null;
        engine.current.renderer.draw();

        // Map Tool -> Mode
        if (tool === 'rect') {
             // Logic to create rect on next click is handled in MouseDown
             // For now, let's auto-create one for demo simplicity or set a "CREATE_RECT" mode
             // Let's keep it simple: Click button -> Add Rect center screen
             const c = engine.current.camera.toWorld(800/2, 600/2); // Approx center
             const n = new Node('rect', { x: c.x, y: c.y, w: 100, h: 100, fill: '#44ff44' });
             engine.current.scene.add(n);
             engine.current.renderer.selection = [n];
             engine.current.renderer.draw();
             setActiveTool('move'); // Switch back
        }
        else if (tool === 'pen') engine.current.mode = MODES.PEN;
        else if (tool === 'text') engine.current.mode = MODES.TEXT;
    };

    // --- MOUSE HANDLERS ---
    const getMouse = (e: React.MouseEvent) => {
        if (!canvasRef.current || !engine.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return engine.current.camera.toWorld(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const core = engine.current;
        if (!core || !canvasRef.current) return;
        if (core.textEditor.activeNode) return; // Don't interrupt text edit

        const world = getMouse(e);

        // 1. Pan (Space or Middle Click)
        if (e.button === 1 || (e.shiftKey && core.mode !== MODES.PEN)) {
            core.mode = MODES.PAN;
            core.dragStart = { x: e.clientX, y: e.clientY };
            return;
        }

        // 2. Pen
        if (core.mode === MODES.PEN) {
            if (!core.currentPath) {
                core.currentPath = new Node('path', { points: [{x: world.x, y: world.y}], stroke:'#44ff44', strokeWidth:2 });
                core.scene.add(core.currentPath);
                core.renderer.selection = [core.currentPath];
            } else {
                core.currentPath.props.points.push({x: world.x, y: world.y});
            }
            core.renderer.draw();
            return;
        }

        // 3. Text
        if (core.mode === MODES.TEXT) {
            const n = new Node('text', { x: world.x, y: world.y, text: 'Type...', fontSize: 24, color: '#ffffff' });
            core.scene.add(n);
            core.renderer.selection = [n];
            core.renderer.draw();
            
            core.textEditor.edit(n);
            core.mode = MODES.IDLE;
            setActiveTool('move');
            return;
        }

        // 4. Resize Handles
        if (core.renderer.selection.length === 1 && ['rect', 'text'].includes(core.renderer.selection[0].type)) {
            const handle = HitTest.findHandle(core.renderer.selection[0], world.x, world.y, core.camera.zoomLevel);
            if (handle) {
                core.mode = MODES.RESIZE;
                core.activeHandle = handle;
                // Take Snapshot
                core.snapshots.clear();
                core.renderer.selection.forEach((n: any) => core.snapshots.set(n.id, JSON.parse(JSON.stringify(n.props))));
                core.dragStart = world;
                return;
            }
        }

        // 5. Selection
        const hit = HitTest.findNode(core.scene, world.x, world.y);
        if (hit) {
            core.mode = MODES.DRAG;
            // Shift logic
            if (e.shiftKey) {
                const idx = core.renderer.selection.indexOf(hit);
                if (idx > -1) core.renderer.selection.splice(idx, 1);
                else core.renderer.selection.push(hit);
            } else {
                if (!core.renderer.selection.includes(hit)) core.renderer.selection = [hit];
            }
            // Snapshot
            core.snapshots.clear();
            core.renderer.selection.forEach((n: any) => core.snapshots.set(n.id, JSON.parse(JSON.stringify(n.props))));
            core.dragStart = world;
        } else {
            if (!e.shiftKey) core.renderer.selection = [];
            core.mode = MODES.IDLE;
        }
        
        core.renderer.draw();
        // Sync React State
        setSelection([...core.renderer.selection]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const core = engine.current;
        if (!core) return;
        const world = getMouse(e);

        if (core.mode === MODES.PAN) {
            core.camera.pan(e.clientX - core.dragStart.x, e.clientY - core.dragStart.y);
            core.dragStart = { x: e.clientX, y: e.clientY };
            core.renderer.draw();
            if (core.textEditor.activeNode) core.textEditor.updatePosition();
        }
        else if (core.mode === MODES.DRAG) {
            const dx = world.x - core.dragStart.x;
            const dy = world.y - core.dragStart.y;
            core.renderer.selection.forEach((node: any) => {
                const snap = core.snapshots.get(node.id);
                if (snap) {
                    if (node.type === 'rect' || node.type === 'text') {
                        node.props.x = snap.x + dx;
                        node.props.y = snap.y + dy;
                    } else if (node.type === 'path') {
                         node.props.points = snap.points.map((p: any) => ({ x: p.x + dx, y: p.y + dy }));
                    }
                }
            });
            core.renderer.draw();
            if (core.textEditor.activeNode) core.textEditor.updatePosition();
        }
        else if (core.mode === MODES.RESIZE) {
            const node = core.renderer.selection[0];
            const snap = core.snapshots.get(node.id);
            const dx = world.x - core.dragStart.x;
            const dy = world.y - core.dragStart.y;
            
            // Logic reused from main.js (Bottom Right only for brevity, add others)
            if (core.activeHandle === 'br') {
                node.props.w = Math.max(10, snap.w + dx);
                node.props.h = Math.max(10, snap.h + dy);
            }
            // ... Add other handles here from previous main.js logic ...

            core.renderer.draw();
        }

        // Cursor Logic
        if (core.mode === MODES.IDLE) {
            let cursor = 'default';
            if (core.renderer.selection.length === 1 && ['rect','text'].includes(core.renderer.selection[0].type)) {
                const h = HitTest.findHandle(core.renderer.selection[0], world.x, world.y, core.camera.zoomLevel);
                if (h) cursor = 'nwse-resize';
            }
            if (cursor === 'default' && HitTest.findNode(core.scene, world.x, world.y)) cursor = 'move';
            if (canvasRef.current) canvasRef.current.style.cursor = cursor;
        }
    };

    const handleMouseUp = () => {
        const core = engine.current;
        if (!core) return;

        if (core.mode === MODES.DRAG || core.mode === MODES.RESIZE) {
            // Commit History here
        }
        if (core.mode !== MODES.PEN && core.mode !== MODES.TEXT) {
            core.mode = MODES.IDLE;
        }
    };

    const handleGenerateCode = () => {
        if (!engine.current) return;
        const compiler = new Compiler(engine.current.scene);
        const result = compiler.compile();
        
        // Update the project file in AppContext
        if (currentProject) {
            updateProjectFile(currentProject.id, 'App.tsx', result.tsx);
            updateProjectFile(currentProject.id, 'index.css', result.css);
            alert("Code Generated & Saved to Project!");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 font-display h-screen w-full overflow-hidden flex flex-col select-none">
            
            {/* TOOLBAR */}
            <header className="h-12 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-sm font-bold">Vectra <span className="text-gray-500 font-normal">/ Builder</span></h1>
                </div>

                <div className="flex items-center bg-gray-100 dark:bg-[#18181b] rounded-lg p-1 border border-border-light dark:border-border-dark gap-1">
                    <button onClick={() => setTool('move')} className={`p-1.5 rounded transition ${activeTool === 'move' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><span className="material-symbols-outlined text-[20px]">arrow_selector_tool</span></button>
                    <button onClick={() => setTool('rect')} className={`p-1.5 rounded transition ${activeTool === 'rect' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><span className="material-symbols-outlined text-[20px]">crop_free</span></button>
                    <button onClick={() => setTool('text')} className={`p-1.5 rounded transition ${activeTool === 'text' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><span className="material-symbols-outlined text-[20px]">title</span></button>
                    <button onClick={() => setTool('pen')} className={`p-1.5 rounded transition ${activeTool === 'pen' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><span className="material-symbols-outlined text-[20px]">edit</span></button>
                </div>

                <div className="flex items-center gap-3">
                     <button onClick={handleGenerateCode} className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded transition shadow-lg">
                        <span className="material-symbols-outlined text-[16px]">code</span>
                        Generate
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                
                {/* LAYERS */}
                <aside className="w-60 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col shrink-0">
                    <div className="h-9 px-4 flex items-center border-b border-border-light dark:border-border-dark">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Layers</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {layers.map((node: any) => (
                            <div key={node.id} className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                                <span className="material-symbols-outlined text-[14px]">{node.type === 'rect' ? 'rectangle' : 'text_fields'}</span>
                                <span>{node.type}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* CANVAS */}
                <main className="flex-1 relative bg-gray-100 dark:bg-[#121212] overflow-hidden flex flex-col" ref={wrapperRef}>
                    <div id="viewport" className="flex-1 relative cursor-crosshair">
                        <canvas 
                            id="canvas" 
                            ref={canvasRef} 
                            className="block w-full h-full"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onDoubleClick={(e) => {
                                // Double click logic mapping
                                const mouse = getMouse(e);
                                const hit = HitTest.findNode(engine.current!.scene, mouse.x, mouse.y);
                                if (hit && hit.type === 'text') engine.current!.textEditor.edit(hit);
                            }}
                        />
                    </div>
                </main>

                {/* PROPERTIES */}
                <aside className="w-[300px] bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex flex-col shrink-0 z-20">
                    <div className="h-9 px-4 flex items-center border-b border-border-light dark:border-border-dark">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Properties</span>
                    </div>
                    <div className="p-4">
                        {selection.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500">Position</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <input className="bg-gray-100 dark:bg-gray-800 border-none rounded text-xs p-1" value={Math.round(selection[0].props.x)} readOnly />
                                        <input className="bg-gray-100 dark:bg-gray-800 border-none rounded text-xs p-1" value={Math.round(selection[0].props.y)} readOnly />
                                    </div>
                                </div>
                                {/* Add more mapped inputs here using handlePropChange logic */}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500 text-center mt-10">Select an object</div>
                        )}
                    </div>
                </aside>

            </div>
        </div>
    );
};
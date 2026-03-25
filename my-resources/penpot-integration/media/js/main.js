import { Camera } from './engine/camera.js';
import { Renderer } from './engine/renderer.js';
import { SceneGraph, Node } from './engine/scene-graph.js';
import { HitTest } from './engine/hit-test.js';
import { UIManager } from './engine/ui-manager.js';
import { LayersManager } from './engine/layers-manager.js';
import { TextEditor } from './engine/text-editor.js';
import { HistoryManager } from './engine/history.js';
import { Compiler } from './engine/compiler.js';
import { IframeManager } from './engine/iframe-manager.js'; // [NEW]

console.log("🚀 VECTRA: Phase 11 (Live Browser)");

const canvas = document.getElementById('canvas');
const debug = document.getElementById('debug');
const vscode = acquireVsCodeApi();

const scene = new SceneGraph();
const camera = new Camera();
const renderer = new Renderer(canvas, camera, scene);
const ui = new UIManager(renderer);
const layers = new LayersManager(renderer, scene);
const iframeManager = new IframeManager(camera, renderer); // [NEW]

// Global Update Loop
function updateUI() {
    ui.update();
    layers.update();
    iframeManager.update(); // [NEW] Sync Iframes
}

// History
const history = new HistoryManager(renderer, updateUI);
ui.history = history;

const textEditor = new TextEditor(camera, renderer, () => {
    renderer.draw(); updateUI();
});

// Init
scene.add(new Node('rect', { x: 100, y: 100, w: 100, h: 100, fill: '#ff0055' }));
renderer.resize();
window.addEventListener('resize', () => renderer.resize());
updateUI();

// --- STATE ---
const MODES = { IDLE: 'idle', PAN: 'pan', DRAG: 'drag', RESIZE: 'resize', PEN: 'pen', TEXT: 'text', EMBED: 'embed' };
let mode = MODES.IDLE;
let activeHandle = null;
let dragStart = { x: 0, y: 0 };
let snapshots = new Map();
let currentPath = null;

function getMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return camera.toWorld(e.clientX - rect.left, e.clientY - rect.top);
}
function takeSnapshots() {
    snapshots.clear();
    renderer.selection.forEach(n => snapshots.set(n.id, JSON.parse(JSON.stringify(n.props))));
}
function commitHistory() {
    renderer.selection.forEach(node => {
        const before = snapshots.get(node.id);
        const after = JSON.parse(JSON.stringify(node.props));
        if (JSON.stringify(before) !== JSON.stringify(after)) {
            history.push({ type: 'update', node: node, before: before, after: after });
        }
    });
    snapshots.clear();
}

// --- EVENTS ---
canvas.addEventListener('dblclick', e => {
    const world = getMouse(e);
    const hit = HitTest.findNode(scene, world.x, world.y);
    if (hit && hit.type === 'text') textEditor.edit(hit);
});

canvas.addEventListener('mousedown', e => {
    if (textEditor.activeNode) return;
    const world = getMouse(e);

    // Pan
    if (e.button === 1 || (e.shiftKey && mode !== MODES.PEN)) {
        mode = MODES.PAN; dragStart = { x: e.clientX, y: e.clientY }; canvas.style.cursor = 'grabbing'; return;
    }

    // Pen
    if (mode === MODES.PEN) {
        if (!currentPath) {
            currentPath = new Node('path', { points: [{x: world.x, y: world.y}], stroke:'#44ff44', strokeWidth:2 });
            scene.add(currentPath); renderer.selection = [currentPath];
            history.push({ type: 'create', node: currentPath });
        } else { currentPath.props.points.push({x: world.x, y: world.y}); }
        renderer.draw(); updateUI(); return;
    }

    // Text
    if (mode === MODES.TEXT) {
        const n = new Node('text', { x: world.x, y: world.y, text: 'Type here...', fontSize: 40, color: '#ffffff' });
        scene.add(n); renderer.selection = [n]; renderer.draw(); updateUI();
        history.push({ type: 'create', node: n });
        textEditor.edit(n); mode = MODES.IDLE; document.getElementById('tool-select').click(); return;
    }

    // [NEW] Embed
    if (mode === MODES.EMBED) {
        const n = new Node('iframe', { x: world.x, y: world.y, w: 400, h: 300, url: 'https://example.com' });
        scene.add(n); renderer.selection = [n]; renderer.draw(); updateUI();
        history.push({ type: 'create', node: n });
        mode = MODES.IDLE; document.getElementById('tool-select').click(); return;
    }

    // Resize
    if (renderer.selection.length === 1 && (renderer.selection[0].type === 'rect' || renderer.selection[0].type === 'text' || renderer.selection[0].type === 'iframe')) {
        const handle = HitTest.findHandle(renderer.selection[0], world.x, world.y, camera.zoomLevel);
        if (handle) {
            mode = MODES.RESIZE; activeHandle = handle; takeSnapshots(); dragStart = world; return;
        }
    }

    // Select
    const hit = HitTest.findNode(scene, world.x, world.y);
    if (hit) {
        mode = MODES.DRAG;
        if (e.shiftKey) {
            const idx = renderer.selection.indexOf(hit);
            if (idx > -1) renderer.selection.splice(idx, 1); else renderer.selection.push(hit);
        } else { if (!renderer.selection.includes(hit)) renderer.selection = [hit]; }
        dragStart = world; takeSnapshots();
    } else {
        if (!e.shiftKey) renderer.selection = [];
        mode = MODES.IDLE;
    }
    renderer.draw(); updateUI();
});

window.addEventListener('mousemove', e => {
    const world = getMouse(e);

    if (mode === MODES.PAN) {
        camera.pan(e.clientX - dragStart.x, e.clientY - dragStart.y);
        dragStart = { x: e.clientX, y: e.clientY }; renderer.draw();
        if (textEditor.activeNode) textEditor.updatePosition();
        iframeManager.update(); // Sync Iframes
    } 
    else if (mode === MODES.DRAG) {
        const dx = world.x - dragStart.x; const dy = world.y - dragStart.y;
        renderer.selection.forEach(node => {
            const snap = snapshots.get(node.id);
            if (snap) {
                if (node.type === 'rect' || node.type === 'text' || node.type === 'iframe') { node.props.x = snap.x + dx; node.props.y = snap.y + dy; }
                else if (node.type === 'path') { node.props.points = snap.points.map(p => ({ x: p.x + dx, y: p.y + dy })); }
            }
        });
        renderer.draw(); updateUI();
        if (textEditor.activeNode) textEditor.updatePosition();
    }
    else if (mode === MODES.RESIZE) {
        const node = renderer.selection[0]; const snap = snapshots.get(node.id);
        const dx = world.x - dragStart.x; const dy = world.y - dragStart.y;
        
        if (activeHandle === 'br') { node.props.w = Math.max(10, snap.w + dx); node.props.h = Math.max(10, snap.h + dy); }
        else if (activeHandle === 'tl') { const newW = Math.max(10, snap.w - dx); const newH = Math.max(10, snap.h - dy); node.props.x = snap.x + (snap.w - newW); node.props.y = snap.y + (snap.h - newH); node.props.w = newW; node.props.h = newH; }
        else if (activeHandle === 'tr') { node.props.y = snap.y + (snap.h - (snap.h - dy)); node.props.w = Math.max(10, snap.w + dx); node.props.h = Math.max(10, snap.h - dy); if(node.props.h===10)node.props.y=snap.y+snap.h-10; else node.props.y=snap.y+dy; }
        else if (activeHandle === 'bl') { node.props.x = snap.x + dx; node.props.w = Math.max(10, snap.w - dx); node.props.h = Math.max(10, snap.h + dy); if(node.props.w===10)node.props.x=snap.x+snap.w-10; }
        
        renderer.draw(); updateUI();
    }

    if (mode === MODES.IDLE) {
        let cursor = 'default';
        if (renderer.selection.length === 1 && renderer.selection[0].type !== 'path') {
            const h = HitTest.findHandle(renderer.selection[0], world.x, world.y, camera.zoomLevel);
            if (h === 'tl' || h === 'br') cursor = 'nwse-resize'; else if (h === 'tr' || h === 'bl') cursor = 'nesw-resize';
        }
        if (cursor === 'default' && HitTest.findNode(scene, world.x, world.y)) cursor = 'move';
        canvas.style.cursor = cursor;
    }
    if (mode === MODES.PEN || mode === MODES.TEXT || mode === MODES.EMBED) canvas.style.cursor = 'crosshair';
});

window.addEventListener('mouseup', () => {
    if (mode === MODES.DRAG || mode === MODES.RESIZE) commitHistory();
    if (mode !== MODES.PEN && mode !== MODES.TEXT && mode !== MODES.EMBED) mode = MODES.IDLE;
    canvas.style.cursor = 'default';
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    camera.zoom(factor, e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    renderer.draw();
    if (textEditor.activeNode) textEditor.updatePosition();
    iframeManager.update(); // Sync Iframes
}, { passive: false });

function bindTool(id, action) {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = () => { document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); action(); };
}

bindTool('tool-select', () => { mode = MODES.IDLE; currentPath = null; });
bindTool('tool-rect', () => {
    const c = camera.toWorld(canvas.width/2, canvas.height/2);
    const n = new Node('rect', { x: c.x-50, y: c.y-50, w: 100, h: 100, fill: '#44ff44' });
    scene.add(n); renderer.selection = [n]; renderer.draw(); updateUI();
    history.push({ type: 'create', node: n });
    document.getElementById('tool-select').click();
});
bindTool('tool-pen', () => { mode = MODES.PEN; renderer.selection = []; currentPath = null; renderer.draw(); updateUI(); });
bindTool('tool-text', () => { mode = MODES.TEXT; renderer.selection = []; renderer.draw(); updateUI(); });
bindTool('tool-embed', () => { mode = MODES.EMBED; renderer.selection = []; renderer.draw(); updateUI(); }); // [NEW]

bindTool('btn-save', () => { vscode.postMessage({ type: 'save', data: scene.getFlatList().map(n => ({ type: n.type, props: n.props })) }); });
bindTool('tool-code', () => {
    const compiler = new Compiler(scene);
    const result = compiler.compile();
    vscode.postMessage({ type: 'export-vanilla', html: result.html, css: result.css, js: result.js });
});

bindTool('action-undo', () => history.undo());
bindTool('action-redo', () => history.redo());
bindTool('action-delete', () => {
    renderer.selection.forEach(node => { scene.remove(node); if (textEditor.activeNode === node) textEditor.finish(); history.push({type:'delete', node}); });
    renderer.selection = []; renderer.draw(); updateUI();
});
bindTool('action-up', () => { if(renderer.selection[0]) { scene.reorder(renderer.selection[0], 'up'); history.push({type:'reorder', node:renderer.selection[0], direction:'up'}); renderer.draw(); updateUI(); }});
bindTool('action-down', () => { if(renderer.selection[0]) { scene.reorder(renderer.selection[0], 'down'); history.push({type:'reorder', node:renderer.selection[0], direction:'down'}); renderer.draw(); updateUI(); }});

window.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === 'Escape') && mode === MODES.PEN) { document.getElementById('tool-select').click(); }
    if (e.key === 'Delete' || e.key === 'Backspace') { if (!textEditor.activeNode) document.getElementById('action-delete').click(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') history.undo();
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') history.redo();
});
import { Matrix } from './matrix.js';

export class Node {
    constructor(type, props = {}) {
        this.type = type; // 'rect', 'path', 'text', 'iframe'
        this.id = Math.random().toString(36).substr(2, 9);
        
        this.props = Object.assign({ 
            x:0, y:0, w:100, h:100, 
            fill: 'none', stroke: '#fff', strokeWidth: 2, 
            points: [],
            text: 'Type here...', fontSize: 24, fontFamily: 'Arial', color: '#ffffff',
            // [NEW] Iframe Props
            url: 'https://example.com' 
        }, props);

        this.children = [];
        this.parent = null;
    }

    add(child) { child.parent = this; this.children.push(child); }
    remove(child) {
        const idx = this.children.indexOf(child);
        if (idx > -1) { this.children.splice(idx, 1); child.parent = null; }
    }
    moveChild(child, direction) {
        const idx = this.children.indexOf(child);
        if (idx === -1) return;
        if (direction === 'up' && idx < this.children.length - 1) {
            [this.children[idx], this.children[idx+1]] = [this.children[idx+1], this.children[idx]];
        } else if (direction === 'down' && idx > 0) {
            [this.children[idx], this.children[idx-1]] = [this.children[idx-1], this.children[idx]];
        }
    }
}

export class SceneGraph {
    constructor() { this.root = new Node('root'); }
    add(node) { this.root.add(node); }
    remove(node) { if (node.parent) node.parent.remove(node); }
    reorder(node, dir) { if (node.parent) node.parent.moveChild(node, dir); }
    getFlatList() {
        const list = [];
        const traverse = (node) => {
            if (node.type !== 'root') list.push(node);
            node.children.forEach(traverse);
        };
        traverse(this.root);
        return list;
    }
}
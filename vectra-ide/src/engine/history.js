export class HistoryManager {
    constructor(renderer, uiUpdateFn) {
        this.renderer = renderer;
        this.onUpdate = uiUpdateFn; 
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 50;
    }

    push(command) {
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo on new action
        if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
        console.log("📜 History Push:", command.type);
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const cmd = this.undoStack.pop();
        this.redoStack.push(cmd);
        this.apply(cmd, true); 
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const cmd = this.redoStack.pop();
        this.undoStack.push(cmd);
        this.apply(cmd, false); 
    }

    apply(cmd, isUndo) {
        const scene = this.renderer.scene;

        // 1. UPDATE (Move, Resize, Props)
        if (cmd.type === 'update') {
            const props = isUndo ? cmd.before : cmd.after;
            // We must target the node by ID in case the reference changed (rare but safe)
            // But for simplicity, we use the direct reference cmd.node
            // Ensure we deep copy to avoid reference pollution
            Object.assign(cmd.node.props, JSON.parse(JSON.stringify(props)));
        }
        
        // 2. CREATE (Undo=Delete, Redo=Add)
        else if (cmd.type === 'create') {
            if (isUndo) scene.remove(cmd.node);
            else scene.add(cmd.node);
        }

        // 3. DELETE (Undo=Add, Redo=Remove)
        else if (cmd.type === 'delete') {
            if (isUndo) scene.add(cmd.node); 
            else scene.remove(cmd.node);
        }

        // 4. REORDER
        else if (cmd.type === 'reorder') {
            const dir = isUndo ? (cmd.direction === 'up' ? 'down' : 'up') : cmd.direction;
            scene.reorder(cmd.node, dir);
        }

        this.renderer.draw();
        this.onUpdate();
    }
}
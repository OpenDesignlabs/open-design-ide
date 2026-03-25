export class HitTest {
    static isPointInRect(px, py, x, y, w, h) {
        return (px >= x && px <= x + w && py >= y && py <= y + h);
    }

    static findNode(scene, x, y) {
        const nodes = scene.getFlatList();
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            
            // RECT & TEXT
            if (node.type === 'rect' || node.type === 'text') {
                if (this.isPointInRect(x, y, node.props.x, node.props.y, node.props.w, node.props.h)) return node;
            }
            // ... inside findNode loop ...
            // Rect & Text & Iframe
            if (node.type === 'rect' || node.type === 'text' || node.type === 'iframe') {
                if (this.isPointInRect(x, y, node.props.x, node.props.y, node.props.w, node.props.h)) return node;
            }
            
            // PATH
            if (node.type === 'path' && node.props.points.length > 0) {
                const pts = node.props.points;
                const minX = Math.min(...pts.map(p=>p.x)), maxX = Math.max(...pts.map(p=>p.x));
                const minY = Math.min(...pts.map(p=>p.y)), maxY = Math.max(...pts.map(p=>p.y));
                // Add padding
                if (this.isPointInRect(x, y, minX-5, minY-5, (maxX-minX)+10, (maxY-minY)+10)) return node;
            }
        }
        return null;
    }

    // FIX: Precise Handle Detection
    static findHandle(node, x, y, cameraZoom) {
        if (node.type !== 'rect' && node.type !== 'text') return null;
        
        const { x: nx, y: ny, w, h } = node.props;
        
        // Match the Renderer size but add padding for easier clicking
        // Renderer draws 8px. We check 14px.
        const size = 14 / (cameraZoom || 1); 
        const half = size / 2;

        // Top-Left
        if (this.isPointInRect(x, y, nx - half, ny - half, size, size)) return 'tl';
        
        // Top-Right
        if (this.isPointInRect(x, y, nx + w - half, ny - half, size, size)) return 'tr';
        
        // Bottom-Left
        if (this.isPointInRect(x, y, nx - half, ny + h - half, size, size)) return 'bl';
        
        // Bottom-Right
        if (this.isPointInRect(x, y, nx + w - half, ny + h - half, size, size)) return 'br';

        return null;
    }
}
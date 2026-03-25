export class Renderer {
    constructor(canvas, camera, scene) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.camera = camera;
        this.scene = scene;
        this.selection = []; 
        this.dpr = window.devicePixelRatio || 1;
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;
        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(this.dpr, this.dpr);
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const t = this.camera.transform.vals; 

        // 1. Clear
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, this.width * this.dpr, this.height * this.dpr);
        ctx.restore();

        // 2. Camera
        ctx.save();
        if (t) ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);

        // 3. Grid
        this.drawGrid(ctx);

        // 4. Scene Nodes
        const nodes = this.scene.getFlatList();
        for (const node of nodes) {
            
            if (node.type === 'rect') {
                ctx.fillStyle = node.props.fill;
                ctx.fillRect(node.props.x, node.props.y, node.props.w, node.props.h);
            }
            else if (node.type === 'path' && node.props.points.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = node.props.stroke;
                ctx.lineWidth = (node.props.strokeWidth || 2) / this.camera.zoomLevel; 
                const pts = node.props.points;
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.stroke();
            }
            // TEXT RENDERER
            else if (node.type === 'text') {
                ctx.font = `${node.props.fontSize}px ${node.props.fontFamily}`;
                ctx.fillStyle = node.props.color;
                ctx.textBaseline = 'top';
                ctx.fillText(node.props.text, node.props.x, node.props.y);
                
                // Update bounds for hit testing
                const m = ctx.measureText(node.props.text);
                node.props.w = m.width;
                node.props.h = node.props.fontSize; // Approx height
            }
        }

        // 5. Selection Box
        if (this.selection.length > 0) {
            const zoom = this.camera.zoomLevel || 1;
            ctx.strokeStyle = '#00aaff';
            ctx.lineWidth = 1.5 / zoom;
            
            for (const node of this.selection) {
                let x, y, w, h;
                
                // Add 'iframe' to the allowed types for box selection
                if (node.type === 'rect' || node.type === 'text' || node.type === 'iframe') {
                    ({x, y, w, h} = node.props);

                } else if (node.type === 'path') {
                    const xs = node.props.points.map(p => p.x);
                    const ys = node.props.points.map(p => p.y);
                    x = Math.min(...xs); y = Math.min(...ys);
                    w = Math.max(...xs) - x; h = Math.max(...ys) - y;
                }

                ctx.strokeRect(x, y, w, h);

                // Handles (Only for Rect/Text)
                if (node.type === 'rect' || node.type === 'text') {
                    const size = 8 / zoom; 
                    const offset = size / 2;
                    ctx.fillStyle = 'white';
                    ctx.lineWidth = 1 / zoom;
                    const drawH = (cx, cy) => {
                        ctx.fillRect(cx - offset, cy - offset, size, size);
                        ctx.strokeRect(cx - offset, cy - offset, size, size);
                    };
                    drawH(x, y); drawH(x+w, y); drawH(x, y+h); drawH(x+w, y+h);
                }
            }
        }
        ctx.restore();
    }

    drawGrid(ctx) {
        const zoom = this.camera.zoomLevel || 1;
        let step = 20;
        if (zoom < 0.5) step = 100;
        if (zoom < 0.1) step = 500;
        const inv = this.camera.transform.inverse();
        const tl = inv.transformPoint({x:0, y:0});
        const br = inv.transformPoint({x:this.width, y:this.height});
        ctx.lineWidth = 1 / zoom;
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        const startX = Math.floor(tl.x / step) * step;
        const startY = Math.floor(tl.y / step) * step;
        for (let x = startX; x < br.x; x += step) { ctx.moveTo(x, tl.y); ctx.lineTo(x, br.y); }
        for (let y = startY; y < br.y; y += step) { ctx.moveTo(tl.x, y); ctx.lineTo(br.x, y); }
        ctx.stroke();
    }
}
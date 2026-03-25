import { Matrix } from './matrix.js';

export class Camera {
    constructor() {
        this.transform = Matrix.identity();
        this.zoomLevel = 1.0;
    }
    pan(dx, dy) {
        const m = Matrix.translate(dx, dy);
        this.transform = m.multiply(this.transform);
    }
    zoom(factor, cx, cy) {
        const newZoom = this.zoomLevel * factor;
        if (newZoom < 0.05 || newZoom > 50) return;
        this.zoomLevel = newZoom;
        const m = Matrix.scale(factor, cx, cy);
        this.transform = m.multiply(this.transform);
    }
    toWorld(x, y) { return this.transform.inverse().transformPoint({x, y}); }
    toScreen(arg1, arg2) { 
        const p = (typeof arg1 === 'object') ? arg1 : {x: arg1, y: arg2};
        return this.transform.transformPoint(p); 
    }
}
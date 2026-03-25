export class TextEditor {
    constructor(camera, renderer, onUpdate) {
        this.camera = camera;
        this.renderer = renderer;
        this.onUpdate = onUpdate;
        this.activeNode = null;
        this.element = null;
    }

    edit(node) {
        if (this.activeNode === node) return;
        this.finish(); 

        this.activeNode = node;
        
        const zoom = this.camera.zoomLevel || 1;
        const screenPos = this.camera.toScreen({x: node.props.x, y: node.props.y});

        this.element = document.createElement('textarea');
        this.element.value = node.props.text;
        
        // Style
        Object.assign(this.element.style, {
            position: 'absolute',
            left: `${screenPos.x}px`,
            top: `${screenPos.y}px`,
            width: `${(node.props.w * zoom) + 50}px`,
            height: `${(node.props.h * zoom) + 20}px`,
            fontSize: `${node.props.fontSize * zoom}px`,
            fontFamily: node.props.fontFamily || 'Arial',
            color: node.props.color || '#ffffff',
            background: 'rgba(0, 0, 0, 0.8)', 
            border: '1px solid #00aaff',
            outline: 'none',
            padding: '0',
            margin: '0',
            overflow: 'hidden',
            resize: 'none',
            zIndex: '10000', // Ensure top
            whiteSpace: 'pre',
            lineHeight: '1'
        });

        this.element.oninput = () => {
            node.props.text = this.element.value;
            // Recalculate Width
            const ctx = this.renderer.ctx;
            ctx.font = `${node.props.fontSize}px ${node.props.fontFamily}`;
            const m = ctx.measureText(node.props.text);
            node.props.w = m.width;
            this.onUpdate();
        };

        this.element.onblur = () => this.finish();

        document.getElementById('viewport').appendChild(this.element);
        this.element.focus();
    }

    updatePosition() {
        if (!this.activeNode || !this.element) return;
        const node = this.activeNode;
        const zoom = this.camera.zoomLevel || 1;
        const screenPos = this.camera.toScreen({x: node.props.x, y: node.props.y});
        this.element.style.left = `${screenPos.x}px`;
        this.element.style.top = `${screenPos.y}px`;
        this.element.style.fontSize = `${node.props.fontSize * zoom}px`;
        this.element.style.width = `${(node.props.w * zoom) + 50}px`; 
        this.element.style.height = `${(node.props.h * zoom) + 20}px`;
    }

    finish() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            this.activeNode = null;
            this.onUpdate();
        }
    }
}
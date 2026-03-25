export class IframeManager {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.container = document.getElementById('viewport'); // Anchor to viewport
        this.overlays = new Map(); // Store active iframes: Map<NodeID, DOMElement>
    }

    // Called every frame/update to sync positions
    update() {
        const nodes = this.renderer.scene.getFlatList();
        const activeIds = new Set();

        nodes.forEach(node => {
            if (node.type !== 'iframe') return;
            
            activeIds.add(node.id);
            let overlay = this.overlays.get(node.id);

            // Create if missing
            if (!overlay) {
                overlay = this.createOverlay(node);
                this.overlays.set(node.id, overlay);
            }

            // Sync Position & Size
            this.syncTransform(overlay, node);
        });

        // Cleanup removed nodes
        for (const [id, elem] of this.overlays) {
            if (!activeIds.has(id)) {
                elem.remove();
                this.overlays.delete(id);
            }
        }
    }

    createOverlay(node) {
        // Wrapper (Positions the frame)
        const wrapper = document.createElement('div');
        wrapper.className = 'iframe-wrapper';
        Object.assign(wrapper.style, {
            position: 'absolute',
            border: 'none',
            overflow: 'hidden',
            backgroundColor: '#fff',
            zIndex: '5' // Below text editor (1000), above canvas (0)
        });

        // The Iframe (The content)
        const iframe = document.createElement('iframe');
        iframe.src = node.props.url || 'about:blank';
        Object.assign(iframe.style, {
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'none' // Default: Disable interaction so we can Drag/Select the node
        });

        // The Glass Pane (For selection/double-click interaction)
        const glass = document.createElement('div');
        Object.assign(glass.style, {
            position: 'absolute', top:0, left:0, right:0, bottom:0,
            zIndex: 10
        });

        // Logic: Double Click to Interact with Website
        glass.addEventListener('dblclick', () => {
            console.log("🔓 Interactive Mode");
            iframe.style.pointerEvents = 'auto'; // Enable website clicks
            glass.style.pointerEvents = 'none';  // Pass through
            wrapper.style.boxShadow = "0 0 0 2px #44ff44"; // Green glow indicator
        });

        // Logic: Mouse leave resets to Design Mode
        wrapper.addEventListener('mouseleave', () => {
            iframe.style.pointerEvents = 'none';
            glass.style.pointerEvents = 'auto';
            wrapper.style.boxShadow = "none";
        });

        wrapper.appendChild(iframe);
        wrapper.appendChild(glass);
        this.container.appendChild(wrapper);

        // Store refs for updates
        wrapper._iframe = iframe; 
        return wrapper;
    }

    syncTransform(wrapper, node) {
        // Update URL if changed from Properties Panel
        if (wrapper._iframe.src !== node.props.url) {
            wrapper._iframe.src = node.props.url;
        }

        const zoom = this.camera.zoomLevel || 1;
        const screenPos = this.camera.toScreen({x: node.props.x, y: node.props.y});

        wrapper.style.left = `${screenPos.x}px`;
        wrapper.style.top = `${screenPos.y}px`;
        wrapper.style.width = `${node.props.w * zoom}px`;
        wrapper.style.height = `${node.props.h * zoom}px`;
    }
}
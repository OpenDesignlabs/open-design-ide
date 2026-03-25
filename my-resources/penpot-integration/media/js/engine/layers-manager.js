export class LayersManager {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.container = document.getElementById('layers-content');
    }
    update() {
        if (!this.container) return;
        this.container.innerHTML = '';
        const nodes = this.scene.getFlatList().reverse();
        if (nodes.length === 0) {
            this.container.innerHTML = '<div style="padding:10px;color:#666;text-align:center;font-size:12px">No Layers</div>';
            return;
        }
        nodes.forEach(node => {
            const div = document.createElement('div');
            div.className = 'layer-item';
            if (this.renderer.selection.includes(node)) div.classList.add('selected');
            let icon = '⬜';
            if (node.type === 'path') icon = '✒️';
            if (node.type === 'text') icon = 'T';
            div.innerHTML = `<span class="layer-icon">${icon}</span> ${node.type} <span style="opacity:0.3;font-size:9px;margin-left:auto">#${node.id.substr(0,4)}</span>`;
            div.onclick = (e) => {
                if (e.shiftKey) {
                    const idx = this.renderer.selection.indexOf(node);
                    if (idx > -1) this.renderer.selection.splice(idx, 1);
                    else this.renderer.selection.push(node);
                } else {
                    this.renderer.selection = [node];
                }
                this.renderer.draw();
                window.dispatchEvent(new CustomEvent('vectra:selection-changed'));
            };
            this.container.appendChild(div);
        });
    }
}
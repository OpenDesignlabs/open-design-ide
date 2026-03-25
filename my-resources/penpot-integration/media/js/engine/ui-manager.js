export class UIManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.container = document.getElementById('props-content');
        this.history = null; 
    }

    update() {
        this.container.innerHTML = '';
        const selection = this.renderer.selection;
        if (selection.length === 0) {
            this.container.innerHTML = '<div class="empty-state">No Selection</div>';
            return;
        }
        const node = selection[0];

        // 1. Rect
        if (node.type === 'rect') {
            this.createHeader('Dimensions');
            const set = (key, val) => this.updateProp(node, key, parseFloat(val));
            this.createRow('X', node.props.x, v => set('x', v));
            this.createRow('Y', node.props.y, v => set('y', v));
            this.createRow('W', node.props.w, v => set('w', v));
            this.createRow('H', node.props.h, v => set('h', v));
            this.createHeader('Fill');
            this.createColorControl(node.props.fill, c => this.updateProp(node, 'fill', c));
        } 
        // 2. Text
        else if (node.type === 'text') {
            this.createHeader('Typography');
            this.createRow('Text', 0, v => this.updateProp(node, 'text', v), false, 'text', node.props.text);
            this.createRow('Size', node.props.fontSize, v => this.updateProp(node, 'fontSize', parseFloat(val)));
            this.createColorControl(node.props.color, c => this.updateProp(node, 'color', c));
        }
        // 3. Path
        else if (node.type === 'path') {
            this.createHeader('Path');
            this.createColorControl(node.props.stroke, c => this.updateProp(node, 'stroke', c));
            this.createRow('Width', node.props.strokeWidth, v => this.updateProp(node, 'strokeWidth', parseFloat(val)));
        }
        // 4. [NEW] Iframe
        else if (node.type === 'iframe') {
            this.createHeader('Browser');
            // URL Input (Text type)
            this.createRow('URL', 0, v => this.updateProp(node, 'url', v), false, 'text', node.props.url);
            
            this.createHeader('Dimensions');
            const set = (key, val) => this.updateProp(node, key, parseFloat(val));
            this.createRow('W', node.props.w, v => set('w', v));
            this.createRow('H', node.props.h, v => set('h', v));
        }
    }

    updateProp(node, key, value) {
        const before = JSON.parse(JSON.stringify(node.props));
        node.props[key] = value;
        this.renderer.draw(); // Redraw selection box
        // History Push
        if (this.history) {
            const after = JSON.parse(JSON.stringify(node.props));
            this.history.push({ type: 'update', node: node, before: before, after: after });
        }
    }

    // ... (Helpers: createHeader, createRow, createColorControl, ensureHex - SAME AS BEFORE) ...
    // NOTE: Keep your existing helper methods here. I am abbreviating for space.
    createHeader(text) { const h = document.createElement('div'); h.className = 'prop-header'; h.textContent = text; this.container.appendChild(h); }
    createRow(label, value, onChange, disabled = false, type = 'number', textVal = null) {
        const row = document.createElement('div'); row.className = 'prop-row';
        const lbl = document.createElement('label'); lbl.textContent = label;
        const inp = document.createElement('input');
        inp.type = type; inp.className = 'prop-input';
        inp.value = type === 'text' ? textVal : Math.round(value);
        if (disabled) inp.disabled = true;
        inp.onchange = (e) => onChange(e.target.value);
        row.appendChild(lbl); row.appendChild(inp);
        this.container.appendChild(row);
    }
    createColorControl(currentColor, onChange) {
        const container = document.createElement('div'); container.className = 'prop-row';
        const group = document.createElement('div'); group.style.cssText = 'display:flex; gap:5px; flex:1; width:100%';
        const hex = this.ensureHex(currentColor);
        const picker = document.createElement('input'); picker.type = 'color'; picker.value = hex;
        picker.style.cssText = 'width:30px; height:26px; border:none; padding:0; background:none; cursor:pointer; border-radius:3px;';
        const txt = document.createElement('input'); txt.type = 'text'; txt.className = 'prop-input'; txt.style.flex = '1'; txt.value = currentColor;
        const sync = (val) => { txt.value = val; picker.value = this.ensureHex(val); onChange(val); };
        picker.addEventListener('change', e => sync(e.target.value)); 
        txt.addEventListener('change', e => sync(e.target.value));
        group.appendChild(picker); group.appendChild(txt);
        container.appendChild(group); this.container.appendChild(container);
    }
    ensureHex(str) { if (!str || str === 'none') return '#000000'; if (str.startsWith('#') && str.length === 4) return '#' + str[1]+str[1]+str[2]+str[2]+str[3]+str[3]; return str; }
}
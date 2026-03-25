const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    vscode.window.registerCustomEditorProvider(
        'opendesign.canvas',
        new CanvasEditorProvider(context),
        { webviewOptions: { retainContextWhenHidden: true } }
    );
}

class CanvasEditorProvider {
    constructor(context) { this.context = context; }

    async resolveCustomTextEditor(document, webviewPanel) {
        webviewPanel.webview.options = { enableScripts: true };
        
        const mediaPath = vscode.Uri.joinPath(this.context.extensionUri, 'media');
        const mediaUri = webviewPanel.webview.asWebviewUri(mediaPath);
        const indexUri = vscode.Uri.joinPath(mediaPath, 'index.html');

        let html = fs.readFileSync(indexUri.fsPath, 'utf8');
        html = html.replace('<head>', `<head><base href="${mediaUri}/">`);
        webviewPanel.webview.html = html;

      webviewPanel.webview.onDidReceiveMessage(async e => {
            if (e.type === 'save') {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    document.uri,
                    new vscode.Range(0, 0, document.lineCount, 0),
                    JSON.stringify(e.data, null, 2)
                );
                vscode.workspace.applyEdit(edit);
            }

            // [NEW] EXPORT VANILLA
            if (e.type === 'export-vanilla') {
                // 1. Get Directory
                const folderPath = path.dirname(document.uri.fsPath);
                
                // 2. Define Paths
                const htmlPath = path.join(folderPath, 'index.html');
                const cssPath = path.join(folderPath, 'style.css');
                const jsPath = path.join(folderPath, 'script.js');

                // 3. Write Files
                fs.writeFileSync(htmlPath, e.html);
                fs.writeFileSync(cssPath, e.css);
                fs.writeFileSync(jsPath, e.js);

                vscode.window.showInformationMessage(`🚀 Exported: index.html, style.css, script.js`);
                
                // 4. Open index.html (Source code view)
                const doc = await vscode.workspace.openTextDocument(htmlPath);
                vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            }
        });

        // Load existing content
        const content = document.getText();
        if (content.trim()) {
            webviewPanel.webview.postMessage({ type: 'load', data: JSON.parse(content) });
        }
    }
}

module.exports = { activate };
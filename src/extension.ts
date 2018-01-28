'use strict';
import * as vscode from 'vscode';
import { VscodeWrapper } from './vscodeWrapper';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "hdfsbrowser" is now active!');

}

// this method is called when your extension is deactivated
export function deactivate() {
}


export class HdfsProvider implements vscode.TreeDataProvider<HdfsNode> {
    onDidChangeTreeData?: vscode.Event<HdfsNode>;

    constructor(context: vscode.ExtensionContext, vscodeApi: VscodeWrapper) {

    }

    getTreeItem(element: HdfsNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }

    getChildren(element?: HdfsNode): vscode.ProviderResult<HdfsNode[]> {
        throw new Error("Method not implemented.");
    }

    addConnection(path: string): void {
        throw new Error("Method not implemented.");
    }

}

export class HdfsNode {

}
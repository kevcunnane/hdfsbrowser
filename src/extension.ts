'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    doActivate(context, new VscodeWrapper());
}

export function doActivate(context: vscode.ExtensionContext, vscodeWrapper: VscodeWrapper) {
    console.log('Congratulations, your extension "hdfsbrowser" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.connectHdfs', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('TODO: Add HDFS Connection String');
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('hdfsFiles', new HdfsTreeDataProvider()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}


/**
 * Wrapper class to act as a facade over VSCode APIs and allow us to test / mock callbacks into
 * this API from our code
 * 
 * @export
 * @class VscodeWrapper
 */
export class VscodeWrapper {

    registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable {
        return vscode.commands.registerCommand(command, callback, thisArg);
    }

    registerTreeDataProvider<T>(viewId: string, treeDataProvider: vscode.TreeDataProvider<T>): vscode.Disposable {
        return vscode.window.registerTreeDataProvider(viewId, treeDataProvider);
    }
}

class HdfsTreeDataProvider implements vscode.TreeDataProvider<object> {
    onDidChangeTreeData?: vscode.Event<object>;
    getTreeItem(element: object): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
    getChildren(element?: object): vscode.ProviderResult<object[]> {
        throw new Error("Method not implemented.");
    }

}
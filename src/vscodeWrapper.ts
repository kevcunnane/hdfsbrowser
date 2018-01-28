'use strict';
import * as vscode from 'vscode';

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
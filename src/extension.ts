'use strict';
import * as vscode from 'vscode';
import { VscodeWrapper } from './vscodeWrapper';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "hdfsbrowser" is now active!');
    context.subscriptions.push(vscode.window.registerTreeDataProvider('hdfs.files',
        new HdfsProvider(context, new VscodeWrapper())));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export interface IFile {
    path: string;
    isDirectory: boolean;
}

export class File implements IFile {
    constructor(public path: string, public isDirectory: boolean) {

    }

    public static createChild(parent: IFile, fileName: string, isDirectory: boolean) {
        let childPath = `${parent}/${fileName}`;
        return new File(childPath, isDirectory);
    }

    public static createFile(parent: IFile, fileName: string) {
        let childPath = `${parent}/${fileName}`;
        return new File(childPath, false);
    }

    public static createDirectory(parent: IFile, fileName: string) {
        let childPath = `${parent}/${fileName}`;
        return new File(childPath, true);
    }
}

export interface IFileSource {

    enumerateFiles(path: string): Promise<IFile[]>;

}

export class HdfsFileSource implements IFileSource {
    enumerateFiles(path: string): Promise<IFile[]> {
        throw new Error("Method not implemented.");
    }
    
}

export class HdfsProvider implements vscode.TreeDataProvider<HdfsNode> {
    static readonly NoConnectionsMessage = 'No connections added';
    static readonly ConnectionsLabel = 'Connections';

    private connections: HdfsNode[];
    private _onDidChangeTreeData = new vscode.EventEmitter<HdfsNode>();

    public get onDidChangeTreeData(): vscode.Event<HdfsNode> {
        return this._onDidChangeTreeData.event;
    }

    constructor(context: vscode.ExtensionContext, vscodeApi: VscodeWrapper) {
        this.connections = [];
        let connectionIndex = 0;
        context.subscriptions.push(vscodeApi.registerCommand('hdfs.connect', () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            vscode.window.showInformationMessage('TODO: Add HDFS Connection String for real');
            this.addConnection(`/connection${connectionIndex}`, new HdfsFileSource());
        }));
    }

    getTreeItem(element: HdfsNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.getTreeItem();
    }

    getChildren(element?: HdfsNode): vscode.ProviderResult<HdfsNode[]> {
        if (element) {
            return element.getChildren();
        } else {
            return this.connections.length > 0 ? this.connections : [new MessageNode(HdfsProvider.NoConnectionsMessage)];
        }
    }

    addConnection(path: string, fileSource: IFileSource): void {
        this.connections.push(new FolderNode(path));
        this._onDidChangeTreeData.fire();
    }

}

export abstract class HdfsNode {


    abstract getChildren(): HdfsNode[] | Promise<HdfsNode[]>;
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
}

export class FolderNode extends HdfsNode {

    constructor(private path: string) {
        super();
    }
    getChildren(): HdfsNode[] | Promise<HdfsNode[]> {
        throw new Error("Method not implemented.");
    }
    getTreeItem(): vscode.TreeItem | Promise<vscode.TreeItem> {
        return new TreeItem(this.path, TreeItemCollapsibleState.Collapsed);
    }
    
}
export class MessageNode extends HdfsNode {

    constructor(private message: string) {
        super();
    }

    getChildren(): HdfsNode[] | Promise<HdfsNode[]> {
        return [];
    }

    getTreeItem(): vscode.TreeItem | Promise<vscode.TreeItem> {
        return new TreeItem(this.message, TreeItemCollapsibleState.None);
    }


    
}

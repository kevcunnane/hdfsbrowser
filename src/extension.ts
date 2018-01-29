'use strict';
import * as vscode from 'vscode';
import * as fspath from 'path';
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

    static createPath(path: string, fileName: string) {
        return fspath.join(path, fileName);
    }

    public static createChild(parent: IFile, fileName: string, isDirectory: boolean) {
        return new File(File.createPath(parent.path, fileName), isDirectory);
    }

    public static createFile(parent: IFile, fileName: string) {
        return File.createChild(parent, fileName, false);
    }

    public static createDirectory(parent: IFile, fileName: string) {
        return File.createChild(parent, fileName, true);
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
        this.connections.push(new FolderNode(path, fileSource));
        this._onDidChangeTreeData.fire();
    }

}

export abstract class HdfsNode {

    abstract getChildren(): HdfsNode[] | Promise<HdfsNode[]>;
    abstract getTreeItem(): TreeItem | Promise<TreeItem>;
}

export class FolderNode extends HdfsNode {
    private children: HdfsNode[];

    constructor(private path: string, private fileSource: IFileSource) {
        super();
    }

    async getChildren(): Promise<HdfsNode[]> {
        if (!this.children) {
            this.children = []
            let files: IFile[] = await this.fileSource.enumerateFiles(this.path);
            if (files) {
                this.children = files.map((file) => {
                    return file.isDirectory ? new FolderNode(file.path, this.fileSource)
                                            : new FileNode(file.path, this.fileSource);
                });
            }
        }
        return this.children;
    }
    getTreeItem(): vscode.TreeItem | Promise<vscode.TreeItem> {
        return new TreeItem(this.path, TreeItemCollapsibleState.Collapsed);
    }
}

export class FileNode extends HdfsNode {

    constructor(private path: string, private fileSource: IFileSource) {
        super();
    }

    getChildren(): HdfsNode[] | Promise<HdfsNode[]> {
        return [];
    }

    getTreeItem(): vscode.TreeItem | Promise<vscode.TreeItem> {
        return new TreeItem(this.fileName, TreeItemCollapsibleState.None);
    }

    get fileName(): string {
        return fspath.basename(this.path);
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

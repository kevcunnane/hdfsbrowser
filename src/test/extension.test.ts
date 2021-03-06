//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import * as should from 'should';
import * as TypeMoq from 'typemoq';
import * as vscode from 'vscode';

import * as myExtension from '../extension';
import { HdfsProvider, HdfsNode, MessageNode, IFileSource, IFile, File, HdfsFileSource, IHdfsClient, IHdfsFileStatus   } from '../extension';
import { VscodeWrapper } from '../vscodeWrapper';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { IMock } from 'typemoq/_all';

async function assertThrowsAsync(fn, regExp) {
    let f = () => {};
    try {
      await fn();
    } catch(e) {
      f = () => {throw e};
    } finally {
      assert.throws(f, regExp);
    }
  }
  
class MockExtensionContext implements vscode.ExtensionContext {
    subscriptions: { dispose(): any; }[];
    workspaceState: vscode.Memento;
    globalState: vscode.Memento;
    extensionPath: string;
    asAbsolutePath(relativePath: string): string {
        throw new Error("Method not implemented.");
    }
    storagePath: string;

    constructor() {
        this.subscriptions = [];
    }
}

function mockVsCodeWrapperForActivation() : TypeMoq.IMock<VscodeWrapper> {
    let vscodeWrapper = TypeMoq.Mock.ofType(VscodeWrapper);
    vscodeWrapper.setup(v => v.registerTreeDataProvider(
        TypeMoq.It.isAnyString(),
        TypeMoq.It.isAny()))
    .returns((viewId, provider) => new vscode.Disposable(void 0));

    vscodeWrapper.setup(v => v.registerCommand(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
    .returns(() => new vscode.Disposable(void 0));

    return vscodeWrapper;
}

class MockFileSource implements IFileSource {
    filesToReturn: Map<string,IFile[]>;
    constructor() {
        this.filesToReturn = new Map<string,IFile[]>();
    }
    enumerateFiles(path: string): Promise<IFile[]> {
        let files: IFile[] = this.filesToReturn.get(path);
        return Promise.resolve(files);
    }
}

describe("When Connecting to HDFS", () => {
    let context = new MockExtensionContext();
    let vscodeApi = mockVsCodeWrapperForActivation();

    it("Should return message if no HDFS Connections exist", async () => {
        // Given a provider
        let hdfsProvider = new HdfsProvider(context, vscodeApi.object);

        // When no connections exists
        // Then there should be a message indicating this for the root node
        let roots: HdfsNode[] = await hdfsProvider.getChildren(null);
        roots.should.have.length(1);
        let treeItem = await roots[0].getTreeItem();
        treeItem.label.should.equal(HdfsProvider.NoConnectionsMessage);
        treeItem.collapsibleState.should.equal(TreeItemCollapsibleState.None);
    });

    it("Should return tree item for any HdfsNode", async () => {
        // Given a provider
        let hdfsProvider = new HdfsProvider(context, vscodeApi.object);

        // When I ask for a tree item
        let label = 'label';
        let item = await hdfsProvider.getTreeItem(new MessageNode(label));

        // Then I expect the item to match
        should(item).not.be.null();
        should(item.label).equal(label);
    })

    it("Should add a node to the tree root", async () => {
        // Given a provider
        let hdfsProvider = new HdfsProvider(context, vscodeApi.object);
        let updateCalled = false;
        hdfsProvider.onDidChangeTreeData(() => updateCalled = true, this);
        // When I add a connection into the provider
        let connectionPath = '/path/to/folder';
        hdfsProvider.addConnection(connectionPath, new MockFileSource());

        // Then 
        should(updateCalled).be.true();

        // ... and the node should be added to the root
        should(hdfsProvider).have.property('connections').with.lengthOf(1);

        // ... and the root should now be expandable
        let roots: HdfsNode[] = await hdfsProvider.getChildren(null);
        roots.should.have.length(1);
        let treeItem = await roots[0].getTreeItem();
        treeItem.label.should.equal(connectionPath);
        treeItem.collapsibleState.should.equal(TreeItemCollapsibleState.Collapsed);
    });

    it("Should expand to show folders and files", async () => {
        // Given 
        // ... and a connected folder
        let fileSource = new MockFileSource();
        let hdfsProvider = new HdfsProvider(context, vscodeApi.object);
        let connectionPath = '/path/to/folder';
        hdfsProvider.addConnection(connectionPath, fileSource);

        // ... and a backing data source with 1 sub-folder and some files
        let connectionFile = new File(connectionPath, true);
        let directory1 =  File.createDirectory(connectionFile, 'dir1');
        fileSource.filesToReturn.set(connectionPath, [
            directory1,
            File.createFile(connectionFile, 'filename1'),
            File.createFile(connectionFile, 'filename2'),
        ]);
        fileSource.filesToReturn.set(directory1.path, [File.createFile(directory1, 'filename3')]);

        // when I expand the connection node
        let connectionNode = await hdfsProvider.getChildren(null)[0];
        let children = await hdfsProvider.getChildren(connectionNode);
        
        // It should list the folders as collapsed
        should(children).have.length(3);
        let dirNode = children[0];
        let item = await dirNode.getTreeItem();
        item.collapsibleState.should.equal(TreeItemCollapsibleState.Collapsed);
        item.label.should.equal('dir1');

        // and the files as not expandable
        item = await children[2].getTreeItem();
        item.collapsibleState.should.equal(TreeItemCollapsibleState.None);
        item.label.should.equal('filename2');
        
        // ... and the sub-directory should have 1 child
        children = await hdfsProvider.getChildren(dirNode);
        should(children).have.length(1);
        item = await children[0].getTreeItem();
        item.collapsibleState.should.equal(TreeItemCollapsibleState.None);
    });
});

describe("HDFS File Source", () => {
    function setupReaddirReturns(client: IMock<IHdfsClient>, err, files): void {
        client.setup(c => c.readdir(TypeMoq.It.isAnyString(), TypeMoq.It.isAny()))
        .returns((path: string, callback: any) => {
            callback(err, files);
            return null;
        });
    }
    // Note: wrote the 2 tests below at the same time, then enabled in sequence
    it("Should handle error case by rejecting with message", async () => {
        // Given an error will occur when connecting
        let errorMsg = 'MyError';
        let mockClient = TypeMoq.Mock.ofType<IHdfsClient>();
        setupReaddirReturns(mockClient, new Error(errorMsg), null);

        // When I enumerate a directory
        let fileSource = new HdfsFileSource(mockClient.object);
        // Then I should reject the promise with the error returned from the client
        assertThrowsAsync(async () => await fileSource.enumerateFiles('/somePath'), errorMsg);
    });

    it("Should convert returned files to files, directories to directories", async () => {
        // Given the client will list 1 directory and 1 file
        let path = 'basepath';
        let mockClient = TypeMoq.Mock.ofType<IHdfsClient>();
        setupReaddirReturns(mockClient, null, [
            <IHdfsFileStatus> { pathSuffix: 'directoryName', type: "DIRECTORY" },
            <IHdfsFileStatus> { pathSuffix: 'fileName', type: "FILE" }
        ]);

        // when I enumerate a directory
        let fileSource = new HdfsFileSource(mockClient.object);
        let files: IFile[] = await fileSource.enumerateFiles(path);

        // then I should get a set of IFiles, with 1 being a directory and 1 being a file
        should(files).have.length(2);
        files[0].isDirectory.should.be.true;
        files[0].path.should.match(File.createPath(path, 'directoryName'));
        files[1].isDirectory.should.be.false;
        files[1].path.should.match(File.createPath(path, 'fileName'));

    })
});
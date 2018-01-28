//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as TypeMoq from 'typemoq';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { VscodeWrapper, doActivate, HdfsNode, HdfsTreeDataProvider } from '../extension';
import { Disposable } from 'vscode';
import * as utils from '../utils';

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
    .returns((viewId, provider) => new Disposable(void 0));

    vscodeWrapper.setup(v => v.registerCommand(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
    .returns(() => new Disposable(void 0));

    return vscodeWrapper;
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Activation Tests", () => {

    // Defines a Mocha unit test
    test("Should have 2 subscriptions registered for disposal", () => {
        // Given an extension context that 
        let context = new MockExtensionContext();
        let vscodeWrapper = mockVsCodeWrapperForActivation();

        // When I activate the extension
        doActivate(context, vscodeWrapper.object);

        // Then I expect 2 objects to have been registered (1 command, 1 tree provider)
        assert.strictEqual(context.subscriptions.length, 2);
    });

    // Defines a Mocha unit test
    test("Should register a HdfsTreeDataProvider", () => {
        // Given an extension context and 
        let context = new MockExtensionContext();
        let vscodeWrapper = mockVsCodeWrapperForActivation();

        // When I activate the extension
        doActivate(context, vscodeWrapper.object);

        // Then I expect a HdfsTreeDataProvider to be registered
        vscodeWrapper.verify(v => v.registerTreeDataProvider(
            TypeMoq.It.isValue('hdfsFiles'),
            TypeMoq.It.is<HdfsTreeDataProvider>(x => true)), 
        TypeMoq.Times.once());
    });
});


// Defines a Mocha test suite to group tests of similar kind together
suite("Tree Provider Tests", () => {


    test("GetTreeItem should return node passed to it", () => {
        // Given a HdfsTreeProvider
        let provider = new HdfsTreeDataProvider();
        let node = new HdfsNode('test');
        // When I call GetItem and pass in a HdfsNode
        let item = provider.getTreeItem(node);
        // The node should be returned
        assert.strictEqual(item, node);
    });

    test("GetChildren should return empty for null input", () => {
        // Given a HdfsTreeProvider
        let provider = new HdfsTreeDataProvider();

        // When I call GetChildren with no input (which is the root condition)
        let result = provider.getChildren(null);

        // Then an empty array should be returned if no HDFS path
        // has been registered
        assert.deepEqual(result, []);
    });

    test("GetChildren should return folder if HDFS path has been added", (done) => {
        // Given a HdfsTreeProvider
        let provider = new HdfsTreeDataProvider();

        // When I save a 
        // ... and call GetChildren
        let connectionPath = '/path/to/remote';
        provider.addConnection(connectionPath);
        let result: Thenable<HdfsNode[]> = utils.asThenable(provider.getChildren(null));
        
        // Then the result should include a folder with that path
        result.then(nodes => {
            assert.equal(nodes.length, 1);
            assert.deepEqual(nodes[0].label, connectionPath);
            // A folder should start as collapsed
            assert.deepEqual(nodes[0].collapsibleState, vscode.TreeItemCollapsibleState.Collapsed);
            done();
        },
        err => done(err));
    });

});


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
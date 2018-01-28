//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import * as should from 'should';
import * as TypeMoq from 'typemoq';
import * as vscode from 'vscode';

import * as myExtension from '../extension';
import { HdfsProvider } from '../extension';
import { VscodeWrapper } from '../vscodeWrapper';

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



describe("When Connecting to HDFS", () => {
    let context = new MockExtensionContext();
    let vscodeApi = mockVsCodeWrapperForActivation();

    it("Should add a node to the tree root", () => {
        // Given a provider
        let hdfsProvider = new HdfsProvider(context, vscodeApi.object);
        // When I add a connection into the provider
        hdfsProvider.addConnection('/path/to/folder');

        // Then the node should be added to the root
        should(hdfsProvider).have.property('root').with.lengthOf(1);
    });
});
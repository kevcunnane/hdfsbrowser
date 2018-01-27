//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { VscodeWrapper, doActivate } from '../extension';

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

// Defines a Mocha test suite to group tests of similar kind together
suite("Activation Tests", () => {

    // Defines a Mocha unit test
    test("Should have 2 subscriptions registered for disposal", () => {
        // Given an extension context that 
        let context = new MockExtensionContext();
        let vscodeWrapper = new VscodeWrapper();
        // When I activate the extension
        doActivate(context, vscodeWrapper);

        // Then I expect 2 objects to have been registered (1 command, 1 tree provider)
        assert.strictEqual(context.subscriptions.length, 2);
    });
});
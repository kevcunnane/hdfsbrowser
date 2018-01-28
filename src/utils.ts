'use strict';
import * as vscode from 'vscode';

export function asThenable<T>(item: vscode.ProviderResult<T>): Thenable<T> {
    return new Promise<T>((resolve, reject,) => {
        if (item instanceof Promise) {
            item.then(resolve, reject);
        } else if (isThenable<T>(item)) {
            item.then(resolve, reject);
        } else {
            resolve(item);
        }
    });
}

export function isThenable<T>(obj: any): obj is Thenable<T> {
    return obj && typeof (<Thenable<any>>obj).then === 'function';
}
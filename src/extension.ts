'use strict';

import * as vscode from 'vscode';
import {Controller} from './main.controller';


export function activate(context: vscode.ExtensionContext) {
    const controller = new Controller(context);

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(controller.onChangeConfiguration, controller));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(controller.onChangeTextEditor, controller));

    context.subscriptions.push(controller);
}

export function deactivate() {
}

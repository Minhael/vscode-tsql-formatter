import * as vscode from 'vscode';
import { format } from './lib';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.languages.registerDocumentRangeFormattingEditProvider('sql', {
		provideDocumentRangeFormattingEdits: (document, range, options) => [
			vscode.TextEdit.replace(range, format(document.getText(range))),
		],
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

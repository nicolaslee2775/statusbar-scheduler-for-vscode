import { window, OutputChannel } from 'vscode';


export class Output {
	static outputChannel: OutputChannel = window.createOutputChannel("statusbar-scheduler");
	static append(value: string) {
		Output.outputChannel.append(value);
	}
	static appendLine(value: string) {
		Output.outputChannel.appendLine(value);
	}
}


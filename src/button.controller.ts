
import { commands, Disposable, window, ExtensionContext, StatusBarAlignment } from 'vscode';

import { Button } from './Class/button';
import { ScheduleItem } from './Class/schedule';
import { ScheduleController } from './schedule.controller';

import { Utils } from './Others/utils';
import { Output } from './Others/output';
import { Logger } from './Others/logger';


export class ButtonController {
	private button: Button;
	private callbackCommmand: string;
	private commandDisposable: Disposable;

	private scheduleCtrl: ScheduleController;


    constructor(schedule: ScheduleItem[], triggerCommandList: string[], document: string, configEntry: any, context: ExtensionContext) {
        
		// Create ScheduleController
		this.scheduleCtrl = new ScheduleController(schedule, triggerCommandList);

		let callbackCommmand = configEntry.triggerCommand;
		this.callbackCommmand = callbackCommmand;

		
		// Create button
		this.button = new Button(context, {
			text: configEntry.text,
			tooltip: configEntry.tooltip,
			color: configEntry.color,
			alignment: (configEntry.alignment === 'right') ? StatusBarAlignment.Right : StatusBarAlignment.Left,
			priority: configEntry.priority,
			include: (configEntry.include) ? new RegExp(configEntry.include) : undefined,
			exclude: (configEntry.exclude) ? new RegExp(configEntry.exclude) : undefined
		});
		this.button.onClick(this._onTriggered, this);
		this.button.refresh(document);
		

		if(callbackCommmand) {
			// Create callback command		
			Utils.registerCommand(callbackCommmand).then(response => {
				Logger.log(`command '${callbackCommmand}' being registered!`);
				Output.appendLine(`\tcommand '${callbackCommmand}' being registered!`);				

				response.callback = () => {
					Logger.log(`command '${callbackCommmand}' is triggered!`);
					this._onTriggered();
				};

				this.commandDisposable = response.disposable;
				context.subscriptions.push(this.commandDisposable);

			}).catch(err => {
				window.showErrorMessage(`'${callbackCommmand}' command is already registered! (text: ${configEntry.text})`);
				Output.appendLine(`Error: '${callbackCommmand}' command is already registered! (text: ${configEntry.text})`);
				this.dispose();
			});
		}
		

    }
    

	dispose() {
        this.button.dispose();
		this.scheduleCtrl.dispose();
		if(this.commandDisposable) {
			Logger.log(`command '${this.callbackCommmand}' disposed!`);	
			Output.appendLine(`\tcommand '${this.callbackCommmand}' disposed!`);	
			this.commandDisposable.dispose();
		}
    }
	
	refresh(document: string) {
		this.button.refresh(document);
	}

	
	_onTriggered() {
		Logger.indent();
		Logger.log("----------------- Start -----------------");
		
		// Execute schedule
		this.scheduleCtrl.exec(onSuccess, onFail);
		function onSuccess(val) {
			Logger.log("----------------- Done! ----------------- val:", val);
			Logger.log("\n");
			Logger.indentLeft();
		}
		function onFail(err) {
			window.showErrorMessage(err);
			Logger.log("----------------- Error! ----------------- err:", err);
			Logger.log("\n");
			Logger.indentLeft();
		}
	}
}
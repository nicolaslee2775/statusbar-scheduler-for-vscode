
import { commands, window, ExtensionContext, workspace, WorkspaceEdit, Range, TextDocument, TextEditor, StatusBarAlignment } from 'vscode';

import { Button } from './Class/button';
import { Schedule, ScheduleItem } from './Class/schedule';
import { ScheduleController } from './schedule.controller';
import { ButtonController } from './button.controller';

import { Output } from './Others/output';
import { Logger } from './Others/logger';



export class Controller {
	private buttonCtrlArray: ButtonController[];

    constructor(private context: ExtensionContext) {
        this.initButtons();
    }
    
    onChangeConfiguration() {
        this.initButtons();
    }

    onChangeTextEditor(textEditor: TextEditor) {
        if (textEditor) {
            const document = textEditor.document.uri.toString();
            this.buttonCtrlArray.forEach(ctrl => ctrl.refresh(document));
        }
    }

	dispose() {
        if (this.buttonCtrlArray) {
			this.buttonCtrlArray.forEach(ctrl => ctrl.dispose());
            this.buttonCtrlArray = null;
        }
    }
	

	/**
     * refresh config
     */
    private initButtons() {

        this.dispose();
		Logger.log("<--------------- initButtons --------------->");


        let document = (window.activeTextEditor) ? window.activeTextEditor.document.uri.toString() : null;

        const config = workspace.getConfiguration('statusbar_scheduler');
		const configMacros = config.get<any[]>('macros');
        const configSchedules= config.get<any[]>('schedules');

		let macroMap = new Map<string, ScheduleItem[]>();
		let triggerCommandList: string[] = [];

        this.buttonCtrlArray = [];
		

		Logger.log("\n// macro");
		configMacros.forEach(configEntry => {
			/*Logger.log("\n");
			Logger.log("name:", configEntry.name);
			Logger.log("macro:", Schedule.scheduleToString(configEntry.macro));
			*/
			Logger.log(configEntry);

			let macroName: string = configEntry.name;
			let macro = Schedule.jsonToSchedule(configEntry.macro);

			macroMap.set(macroName, macro);
		});


		Logger.log("\n// schedule");
		configSchedules.forEach((configEntry, i) => {
			/*Logger.log("\n");
			Logger.log("id:", i);
			Logger.log("text:", configEntry.text);
			Logger.log("tooltip:", configEntry.tooltip);
			Logger.log("triggerCommand:", configEntry.triggerCommand);
			Logger.log("alignment:", configEntry.alignment);
			Logger.log("priority:", configEntry.priority);
			Logger.log("schedule:", Schedule.scheduleToString(configEntry.schedule));*/
			Logger.log(configEntry);			

			let schedule = Schedule.jsonToSchedule(configEntry.schedule, macroMap);
			const buttonCtrl = new ButtonController(schedule, triggerCommandList, document, configEntry, this.context);

            this.buttonCtrlArray.push(buttonCtrl);
			if(configEntry.triggerCommand) triggerCommandList.push(configEntry.triggerCommand);
        });
		
		Logger.log("</--------------- initButtons --------------->");
		Logger.log("\n");

		let now = new Date();
		let nowStr = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + 
					" " + 
					(now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear();

		Logger.log(`updated! macro: ${configMacros.length}, schedule: ${configSchedules.length} \t ${nowStr}`);
		Output.appendLine(`updated! macro: ${configMacros.length}, schedule: ${configSchedules.length} \t ${nowStr}`);
    }

}


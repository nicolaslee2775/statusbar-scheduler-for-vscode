import { commands } from 'vscode';
import { Output } from '../Others/output';
import { Logger } from '../Others/logger';


export type ScheduleCallback = (value?: any) => void;

export interface ScheduleItem {
	exec: (onfulfilled: ScheduleCallback, onrejected: ScheduleCallback) => void;
	dispose: () => void;
}


export class Command implements ScheduleItem {
	commandStr: string;
	args: any[];

	constructor(commandStr: string, args: any[]) {
		this.commandStr = commandStr;
		this.args = args;
	}

	exec(onfulfilled: ScheduleCallback, onrejected: ScheduleCallback) {
		//commands.executeCommand(this.commandStr)
		commands.executeCommand.apply(null, [this.commandStr].concat(this.args))
			.then(value => {
				onfulfilled(value);
			}, reason => {
				Logger.error("executeCommand err:", reason);
				onrejected(reason);
			});
	}

	dispose() {}
}


export namespace Action {
	export class Delay implements ScheduleItem {
		time: number;

		constructor(args: any[]) {
			this.time = args[0];
		}

		exec(onfulfilled: ScheduleCallback, onrejected: ScheduleCallback) {
			setTimeout(() => onfulfilled(), this.time);
		}

		dispose() {}
	}


	export class Log implements ScheduleItem {
		text: string;

		constructor(args: any[]) {
			this.text = args[0];
		}

		exec(onfulfilled: ScheduleCallback, onrejected: ScheduleCallback) {
			Logger.log(this.text);
			Output.appendLine(this.text);
			onfulfilled();
		}

		dispose() {}
	}


	export class ShowCommand implements ScheduleItem {

		constructor(args: any[]) {}

		exec(onfulfilled: ScheduleCallback, onrejected: ScheduleCallback) {
			commands.getCommands()
				.then(commandList => {
					Output.appendLine("\nCommand:");										
					commandList.forEach((commamd, i) => {
						Logger.log(i, ":", commamd);
						Output.appendLine(i + " : " + commamd);
					});
					Output.appendLine("");					
					onfulfilled();
				}, err => {
					onrejected(err);
				});
		}

		dispose() {}
	}

	export class StartDebug implements ScheduleItem {

		constructor(args: any[]) {}

		exec(onfulfilled: ScheduleCallback, onrejected: ScheduleCallback) {
			commands.executeCommand("vscode.startDebug")
		}

		dispose() {}
	}
	
}

/*class Macro implements ScheduleItem {

	constructor(private schedule: ScheduleItem[]) {
	}

	exec(onfulfilled: Callback, onrejected: Callback) {
	}

	dispose() {
	}
}*/

export namespace Schedule {

	export function jsonToSchedule(scheduleJSON: any[], macroMap?: Map<string, ScheduleItem[]>): ScheduleItem[] {
		let schedule: ScheduleItem[] = [];

		scheduleJSON.forEach(obj => {
			if(obj.hasOwnProperty("command")) {
				let args = obj.args || [];
				schedule.push(new Command(obj.command, args));

			} else if(obj.hasOwnProperty("action")) {
				let args = obj.args || [];
				switch(obj.action) {
					case "delay":
						schedule.push(new Action.Delay(args));
						break;
					case "log":
						schedule.push(new Action.Log(args));
						break;
					case "showCommand":
						schedule.push(new Action.ShowCommand(args));
						break;
				}

			} else if(obj.hasOwnProperty("macro")) {
				if(macroMap) {
					let macroName = obj.macro;
					let macro = macroMap.get(macroName);
					//schedule.push(new Macro(macro));
					macro.forEach(scheduleItem => {
						schedule.push(scheduleItem);
					})
				}
			}
		});
		return schedule;
	}

	export function scheduleToString(schedule: any[]): string {
		var str = "[\n";
		schedule.forEach(element => {
			str += "\t{";
			if(element.command) {
				str += (" command: " + element.command);
			} else if(element.action) {
				str += (" action: " + element.action);
				str += (", args: [" + (element.args ? element.args.join(", ") : "") + "]");
			} else if(element.macro) {
				str += (" macro: " + element.macro);
			}
			str += " },\n";
		});
		str += "]";
		return str;
	}
}


		
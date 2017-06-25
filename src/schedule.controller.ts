import { ScheduleCallback, ScheduleItem, Command } from './Class/schedule'
import { Logger } from './Others/logger';


export class ScheduleController implements ScheduleItem {
	triggerCommandList: string[];

	pointer: number;
	running: boolean;

	schedule: ScheduleItem[];

	constructor(schedule: ScheduleItem[], triggerCommandList: string[]) {
		this.pointer = 0;
		this.running = false;

		this.triggerCommandList = triggerCommandList;
		this.schedule = schedule;
	}

	dispose() {
		if(this.schedule != null) {
			this.schedule.forEach(item => {
				item.dispose();
			});
			this.schedule = null;
		}
	}

	exec(resolve: ScheduleCallback, reject: ScheduleCallback) {
		if(this.running) {
			reject("Still running");
		} else {
			this.running = true;
			this.runner(onSuccess.bind(this), onFail.bind(this));

			function onSuccess(value) {
				this.pointer = 0;
				this.running = false;
				resolve(value);
			}
			function onFail(reason) {
				this.pointer = 0;
				this.running = false;
				reject(reason);
			}
		}
	}

	private runner(resolve: ScheduleCallback, reject: ScheduleCallback) {
		if(this.pointer < this.schedule.length) {
			let item = this.schedule[this.pointer];


			if(item instanceof Command) {
				let commandStr = (item as Command).commandStr;
				let index = this.triggerCommandList.findIndex(val => val === commandStr);
				if(index !== -1) {
					reject("Error: Executing triggerCommand!");
					return;
				}
			}


			// Execute the Schedule item
			item.exec(onSuccess.bind(this), onFail.bind(this));

			function onSuccess(val) {
				this.pointer++;
				this.runner(resolve, reject);
			}
			function onFail(err) {
				Logger.log("inside err:", err);
				reject(err);
			}
			
		} else {
			resolve();
		}
	}
}

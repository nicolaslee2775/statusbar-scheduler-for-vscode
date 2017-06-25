import { commands, Disposable } from 'vscode';

export namespace Utils {

	type Callback = (...args: any[]) => void;

	interface RegisterCommandResonse {
		disposable: Disposable;
		callback: () => void;
		thisArg: any;
	}

	export function registerCommand(command: string): Promise<RegisterCommandResonse> {
		return new Promise((resolve, reject) => {
			var response = {
				disposable: null,
				callback: () => {},
				callbackThisArg: null
			};
			try {
				response.disposable = commands.registerCommand(command, (...args) => {
					response.callback.apply(response.callbackThisArg, args);
				});
				resolve(response);
			} catch(err) {
				//if(err.message === "command with id already exists")
				reject(err);
			}	
		});
	}	
	
}

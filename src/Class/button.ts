import { commands, Disposable, window, ExtensionContext, StatusBarAlignment, StatusBarItem } from 'vscode';
import { IndexGenerator } from '../Others/indexGenerator';
import { Output } from '../Others/output';
import { Logger } from '../Others/logger';



const COMMAND_PREFIX = "extension.statusbar_scheduler._buttonCallback";


interface ButtonOptions {
	text: string;
	tooltip?: string;
	color?: string;
	alignment?: StatusBarAlignment;
	priority?: number;
	
	include?: RegExp;
	exclude?: RegExp;
	
	callback?: (...any) => void;
	callbackThisArg?: Object;
	callbackArgs?: any[];
}

export class Button {	
	private index: number;

	statusBarItem: StatusBarItem = null;
	commandDisposable: Disposable; 

	include: RegExp;
	exclude: RegExp;

	callback: (...any) => void;
	callbackThisArg: Object;
	callbackArgs: any[];

	constructor(private context: ExtensionContext, options: ButtonOptions) {
		
		// Create callback command
		this.index = IndexGenerator.get();
		let callbackCommand = (COMMAND_PREFIX + this.index);

		// Registor command
		this.commandDisposable = commands.registerCommand(callbackCommand, this._onTrigger.bind(this));
		context.subscriptions.push(this.commandDisposable);


		// Create StatusBarItem
		this.statusBarItem = window.createStatusBarItem(options.alignment || StatusBarAlignment.Left, options.priority);
		this.statusBarItem.text = options.text;
        this.statusBarItem.tooltip = options.tooltip || "";
        this.statusBarItem.color = options.color || ""; 
        this.statusBarItem.command = callbackCommand;
		this.statusBarItem.show();

		// Save others
		this.callback = options.callback;
		this.callbackArgs = options.callbackArgs;
		this.callbackThisArg = options.callbackThisArg;


		Logger.log(`Button${this.index} init... (${callbackCommand})`);
	}

	dispose() {
		if (this.statusBarItem) {
			Logger.log(`Button${this.index} disposed!`);
			this.statusBarItem.dispose();
			this.statusBarItem = null;
			this.commandDisposable.dispose();
			this.callback = null;
			this.callbackArgs = null;
			this.callbackThisArg = null;
			IndexGenerator.remove(this.index);
		}
	}

	onClick(callback: (...any) => void, thisArg?: Object) {
		this.callback = callback;
		if(thisArg) this.callbackThisArg = thisArg;
	}

	refresh(document: string) {
		if(!this.statusBarItem) return;

        let visible = true;
        if (this.include) {
            Logger.log(this.include.source);
            visible = document && this.include.test(document);
        }
        if (this.exclude) {
            visible = document && !this.exclude.test(document);
        }
        if (visible) {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

	private _onTrigger() {
		try {
			Logger.log(`command '${this.statusBarItem.command}' is triggered!`);
			if(this.callback) this.callback.apply(this.callbackThisArg, this.callbackArgs);
		} catch (err) {
			Logger.log(err);
		}
		
	}

}
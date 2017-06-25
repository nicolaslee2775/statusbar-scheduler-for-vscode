
export class Logger {

	static indentSpacing: number = 4;
	static indentIndex: number = 0;

	static indent() {
		Logger.indentIndex++;
	}

	static indentLeft() {
		if(Logger.indentIndex > 0) Logger.indentIndex--;
	}

	static log(...args){
		let space = " ".repeat(Logger.indentSpacing);
		let newArgs = [space.repeat(Logger.indentIndex)].concat(args);
		console.log.apply(null, newArgs);
	}

	static println(str: string) {
		let space = " ".repeat(Logger.indentSpacing);
		let newStr = space.repeat(Logger.indentIndex) + str;
		console.log(newStr);
	}	
	
	static error(...args){
		let space = " ".repeat(Logger.indentSpacing);
		let newArgs = [space.repeat(Logger.indentIndex)].concat(args);
		console.error.apply(null, newArgs);
	}

}

export class IndexGenerator {
	private static count: number = 0;
	private static nextIndex: number = 0;
	private static map: boolean[] = [];

	static get(): number {
		var index = (function() {
			if(IndexGenerator.count === 0) {
				// no id is used
				//console.log('IndexGenerator: no id is used');
				IndexGenerator.nextIndex = 0;
				return IndexGenerator.nextIndex++;
				
			} else if(IndexGenerator.count === IndexGenerator.nextIndex) {
				// all the previous id is used
				//console.log('IndexGenerator: all the previous id is used');				
				return IndexGenerator.nextIndex++;

			} else {
				// some of the id btw 0 & nexIndex are empty
				//console.log('IndexGenerator: some of the id btw 0 & nexIndex are empty');				
				for(var i = 0; i < IndexGenerator.nextIndex; i++)
					if(!IndexGenerator.map[i]) return i;	
			}
		})();
		IndexGenerator.map[index] = true;
		IndexGenerator.count++;
		//console.log(`IndexGenerator.get: ${index}`);
		return index;
	}

	static remove(index): boolean {
		if(index >= 0 && index < IndexGenerator.nextIndex) {
			//console.log(`IndexGenerator.remove: ${index}`);			
			IndexGenerator.count--;
			IndexGenerator.map[index] = undefined;
			return true;
		} else {
			return false;
		}
	}

	/*
	var Unique = IndexGenerator;
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	console.log('rm:', Unique.remove(1), Unique.map, Unique.count, Unique.nextIndex);
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	console.log('rm:', Unique.remove(2), Unique.map, Unique.count, Unique.nextIndex);
	console.log('rm:', Unique.remove(0), Unique.map, Unique.count, Unique.nextIndex);
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	console.log('get:', Unique.get(), Unique.map, Unique.count, Unique.nextIndex);
	*/
}
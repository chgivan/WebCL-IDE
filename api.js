//BASE OF https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
window.WEBCL_IDE = {
		TEMP_RESULT:undefined,
		TYPES : {
			BOOL:0,
			INT:1,
			STRING:2,
			VECTOR_INT_8:-1,VECTOR_BYTE:-1,
			VECTOR_UINT_8:-2,VECTOR_CHAR:-2,
			VECTOR_UINT_8_CLAMPED:-3,
			VECTOR_INT_16:-4,VECTOR_SHORT:-4,
			VECTOR_UINT_16:-5,VECTOR_USHORT:-5,
			VECTOR_INT_32:-6,VECTOR_INT:-6,
			VECTOR_UINT_32:-7,VECTOR_UINT:-7,
			VECTOR_FLOAT_32:-8,VECTOR_FLOAT:-8,
			VECTOR_FLOAT_64:-9,VECTOR_DOUBLE:-9
		}
}; 

//=====================Data===================// 
function Data(){
	this._data = {};
}
Data.prototype.add = function(name,buffer){
	name = name.toLowerCase(); 
	if(this._data.hasOwnProperty(name)){return false;}//If name exist return false
	this._data[name] = buffer;
}
Data.prototype.get = function(name){
	name = name.toLowerCase(); 
	if(!this._data.hasOwnProperty(name)){return false;}//If name does not exist return false
	return this._data[name];
}
Data.prototype.set = function(name , buffer){
	name = name.toLowerCase(); 
	if(this._data.hasOwnProperty(name)){return false;}//If name does not exist return false
	this._data[name] = buffer;
	return true;
}
Data.prototype.getData = function(){
	return this._data;
}
//===================End Data===================// 
//=====================Result===================//
function Result( timers , data){
	this._timers = timers;
	for(var key in data){
		this[key] = data[key];
	}
}
Result.prototype.mark = function(timer){
	this._timers[timer.toLowerCase()] = Date.now();
}
Result.prototype.unmark = function(timer){
	var timer = timer.toLowerCase(); 
	this._timers[timer] = Date.now() - this._timers[timer];
}
//==================End Result===================// 
//=====================Task===================// 
function Task(timers , results , data , sources){
	this.times = timers;
	this["get"] = data;
	this["set"] = results;
	this.sources = sources;
}
Task.prototype.mark = function(timer){
	this.times[timer.toLowerCase()] = performance.now();
}
Task.prototype.unmark = function(timer){
	var timer = timer.toLowerCase(); 
	this.times[timer] = performance.now() - this.times[timer];
}
//==================End Task===================// 
//====================Project=================// 
function Project(name){
	if(name !== undefined){this.create(name);}
}
//============= create/load/output ======================//
Project.prototype.create = function(name){
	this.name = name;
	this.timers = new Array();
	this.parameters = new Array();
	this.sources = new Array();
	this.results = new Array();
} 
Project.prototype.load = function(json){
	var obj = JSON.parse(json);
	this.name = obj.name;
	this.timers =  obj.timers;
	this.parameters = obj.parameters;
	this.sources = obj.sources;
	this.results = obj.results;//Array->{name:String,timers:Array,data:Array->{name:String,type:Type,value:Object}}
}
Project.prototype.output = function(){
	return JSON.stringify(this);
} 
//===============End create/load/output ======================//
//============= Build/Execute ======================//
Project.prototype.build = function(src_name){
	var src_index = this.indexOfSource(src_name);
	if(src_index < 0){throw "Given Source does not exist!!";}
	if(this.sources[src_index].type != "js"){throw "Given Source is not javascript type";}
	return new Function(this.buildArgs(),this.sources[src_index].body); 
}
Project.prototype.execute = function(exec , result ,data){
	exec.apply(null,this.buildParameter(result , data));
}
Project.prototype.buildTask = function(data){
	var results = this.buildResults(data);
	var data = this.buildData(data);;
	var timers = this.buildTimers();
	var sources = this.buildSources();
	return new Task(timers , results , data ,  sources);
}
Project.prototype.buildTimers = function(){
	var obj = {};
	for (var i = 0 ; i < this.timers.length ; i++) {
		obj[this.timers[i]] = undefined;
	}
	return obj;
}
Project.prototype.buildSources = function(){
	var obj = {};
	for (var i = 0 ; i < this.sources.length ; i++) {
		if(this.sources[i].type == "cl"){
			obj[this.sources[i].name] = this.sources[i].body;
		}
	}
	return obj;
}
Project.prototype.buildData = function(data){
	var obj = {};
	for (var i = 0 ; i < this.parameters.length ; i++) {
		if(!this.parameters[i].isResult){
			if(this.parameters[i].type < 0){
				var buffer = data.get(this.parameters[i].name);
				if(!buffer){throw "Buffer " + this.parameters[i].name + " does not exist at data object!!";}//Buffer does not exist throw error;
				obj[this.parameters[i].name] = buffer;
			}else{
				obj[this.parameters[i].name] = this.parameters[i].value;
			}
		}
	}
	return obj;
}
Project.prototype.buildResult = function(){
	return new Result(this.buildTimers(), this.buildResults());
}

Project.prototype.buildResults = function(){
	var obj = {};
	for (var i = 0 ; i < this.parameters.length ; i++) {
		if(this.parameters[i].isResult){
			obj[this.parameters[i].name] = this.buildEmptyBuffer(this.parameters[i].type , this.parameters[i].value);
		}
	}
	return obj;
}
Project.prototype.buildEmptyBuffer =  function(type , lenght){
	switch(type){
	case WEBCL_IDE.TYPES.VECTOR_INT_8:
		return new Int8Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_UINT_8:
		return new Uint8Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_UINT_8_CLAMPED:
		return new Uint8ClampedArray(lenght);
	case WEBCL_IDE.TYPES.VECTOR_INT_16:
		return new Int16Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_UINT_16:
		return new Uint16Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_INT_32:
		return new Int32Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_UINT_32:
		return new Uint32Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_FLOAT_32:
		return new Float32Array(lenght);
	case WEBCL_IDE.TYPES.VECTOR_FLOAT_64:
		return new Float64Array(lenght);
	default:
		return undefined;
	}
}
Project.prototype.buildArray = function(name , buffer){
	name = name.toLowerCase();
	var index = this.indexOfParameter(name);
	if(index < 0){return false;}//Parameter does not exist return false
	switch(	this.parameters[index].type){
	case WEBCL_IDE.TYPES.VECTOR_INT_8:
		return new Int8Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_UINT_8:
		return new Uint8Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_UINT_8_CLAMPED:
		return new Uint8ClampedArray(buffer);
	case WEBCL_IDE.TYPES.VECTOR_INT_16:
		return new Int16Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_UINT_16:
		return new Uint16Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_INT_32:
		return new Int32Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_UINT_32:
		return new Uint32Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_FLOAT_32:
		return new Float32Array(buffer);
	case WEBCL_IDE.TYPES.VECTOR_FLOAT_64:
		return new Float64Array(buffer);
	default:
		return false;
	}
}
Project.prototype.buildArgs = function(){
	var args = new Array();
	args.push("_mark");
	args.push("_unmark");
	args.push("_sources");
	args.push("_result");
	for(var i = 0 ; i < this.parameters.length ; i++){
		if(!(this.parameters[i].type > 0 && this.parameters[i].isResult)){
			args.push(this.parameters[i].name);
		}
	}
	return args;
}
Project.prototype.buildParameter = function(result , data){
	var parameters = new Array();
	parameters.push(new Function(['timer'] , "WEBCL_IDE.TEMP_RESULT.mark(timer);"));
	parameters.push(new Function(['timer'] , "WEBCL_IDE.TEMP_RESULT.unmark(timer);"));
	parameters.push(this.buildSources());
	parameters.push(result);
	for(var i = 0; i < this.parameters.length; i++){
		if(this.parameters[i].isResult){
			if(this.parameters[i].type < 0){
				parameters.push(result[this.parameters[i].name]);
			}
		}else{
			if(this.parameters[i].type < 0){
				var buffer = data.get(this.parameters[i].name);
				if(!buffer){throw "Buffer " + this.parameters[i].name + " does not exist at data object!!";}//Buffer does not exist throw error;
				parameters.push(buffer);
			}else{
				parameters.push(this.parameters[i].value);
			}
		}
	}
	return parameters;
}
//=============End Build/Execute ======================//
//==============Source Manage=====================//
Project.prototype.addSource = function(name , type ,  body){
	name = name.toLowerCase();
	if(this.indexOfSource(name) > -1){return false;}//Source name exist return false
	this.sources.push({name:name , type:type , body:body});
	return true;
}
Project.prototype.updateSource = function(name , body){
	name = name.toLowerCase();
	var index = this.indexOfSource(name);
	if(index < 0){return false;}//Source name does not exist return false
	this.sources[index].body = body; 
	return true;
}
Project.prototype.getSource = function(name){
	name = name.toLowerCase();
	var index = this.indexOfSource(name);
	if(index < 0){return false;}//Source name does not exist return false
	return this.sources[index].body; 
}
Project.prototype.removeSource = function(name){
	name = name.toLowerCase();
	var index = this.indexOfSource(name);
	if(index < 0){return false;}//Source name does not exist return false
	this.sources.splice(index, 1);
	return true;
}
Project.prototype.indexOfSource = function(t_name){
	name = t_name.toLowerCase();
	for(var i = 0 ; i < this.sources.length ; i++ ){
		if(name == this.sources[i].name){return i;}
	}
	return -1;
}
//==============End Source Manage=====================//
//==============Timers Manage=====================//
Project.prototype.addTimer = function(timer){
	timer = timer.toLowerCase();
	if(this.timers.indexOf(timer) > -1){return false;}//Timer exist return false
	this.timers.push(timer);
	return true;
}
Project.prototype.removeTimer = function(timer){
	timer = timer.toLowerCase();
	var index = this.timers.indexOf(timer);
	if(index < 0){return false;}//Timer does not exist return false
	this.timers.splice(index,1);
	return true;
}
//==============End Timers Manage=====================//
//==============Parameter  Manage=====================//
Project.prototype.addParameter = function(name , type , value , isResult){
	name = name.toLowerCase();
	if(this.indexOfParameter(name) > -1){return false;}//Parameters exist return false
	if(value === undefined){value = undefined;}
	if(isResult === undefined){isResult = false;}
	var obj = {name: name , type:type , isResult:isResult , value:value};
	this.parameters.push(obj);
	return true;
}
Project.prototype.updateParameter = function(name , value){
	name = name.toLowerCase();
	var index = this.indexOfParameter(name);
	if(index < 0){return false;}//Parameter does not exist return false
	this.parameters[index].value = value; //Todo Convent
	return true;
}
Project.prototype.removeParameter = function(name){
	name = name.toLowerCase();
	var index = this.indexOfParameter(name);
	if(index < 0){return false;}//Parameter does not exist return false
	this.parameters.splice(index,1);
	return true;
}
Project.prototype.indexOfParameter = function(name){
	name = name.toLowerCase();
	for(var i = 0 ; i < this.parameters.length ; i++ ){
		if(name == this.parameters[i].name){return i;}
	}
	return -1;
}
//==============End Parameter Manage=====================//
//==============Results  Manage=====================//
Project.prototype.addResult = function(name , result , data){
	name = name.toLowerCase();
	if(this.indexOfResult(name) > -1){return false;}//Parameters exist return false
	var results = new Array();
	for(var i = 0 ; i < this.parameters.length ; i++ ){
		var par = this.parameters[i];
		if(par.isResult){
			var resultValue;
			if(par.type < 0){
				var resultName =  name + "-" + par.name;
				if(!data.set(resultName,result[par.name])){throw resultName + " already exist in the data!!";}
				resultValue = resultName;
			}else{
				resultValue = result[par.name];
			}
			results.push({name:par.name,type:par.type,value:resultValue});
		}
	}
	this.results.push({name:name,timers:result._timers,results:results});
}
Project.prototype.indexOfResult = function(name){
	name = name.toLowerCase();
	for(var i = 0 ; i < this.results.length ; i++ ){
		if(name == this.results[i].name){return i;}
	}
	return -1;
}
//==============End Results Manage=====================//
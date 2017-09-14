String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function Utils (){}

//Return a html String of input element with the form-group div of bootstrap
Utils.prototype.types2Input = function (id , label , type , value) {
	//Checking parameters
	if(id === undefined){return false;}
	if(label === undefined){label = "";}
	if(type === undefined){type = WEBCL_IDE.TYPES.STRING;}
	
	switch(type){
		case WEBCL_IDE.TYPES.STRING:
			if(value === undefined){value = "";}
			return "<div class='form-group'>"
			+"<label for='"+id+"'>"+label+"</label>"
			+"<input type='text' class='form-control' id='"+id+"' value='"+value+"'>"
			+"</div>"; 
		case WEBCL_IDE.TYPES.BOOL:
			if(value === undefined){value = false;}
			var checked = "";
			if(value){checked = "checked"}
			return "<div class='checkbox'><label>"
			+"<input type='checkbox' id='"+id+"' value='' "+checked+">"
			+label
			+"</label></div>"; 
		case  WEBCL_IDE.TYPES.TYPE:
			if(value === undefined){value =  WEBCL_IDE.TYPES.STRING;}
			var optionsHtml = "";
			for(var key in WEBCL_IDE.TYPES){
				if(WEBCL_IDE.TYPES[key] >= 0){
					optionsHtml += "<option value='"+WEBCL_IDE.TYPES[key]+"'>"+key+"</option>";
				}
			}
			return "<div class='form-group'>"
			+"<label for='"+id+"'>"+label+"</label>"
			+"<select class='form-control' id='"+id+"'>"
			+optionsHtml
			+"</select></div>"; 
	}
	return false;
}

//Return the value of a input element
Utils.prototype.input2value = function (id , type) {
	if(id === undefined){return false;}
	if(type === undefined){type = WEBCL_IDE.TYPES.STRING;}
	
	var input = $(id);
	switch(type){
		case WEBCL_IDE.TYPES.STRING:
			return input.val();
		case WEBCL_IDE.TYPES.BOOL:
			return input.is(':checked');
	}
	return false;
}

Utils.prototype.test = function () {
	alert("test ok");
}

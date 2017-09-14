//------------Timer Modal And operations------------//
EventSheet.prototype.getTimerName = function () {
	App.showInputModal(
			{"name":{"value":"timer" , "label" : "Timer Name" , "type" : WEBCL_IDE.TYPES.STRING}}
			,App.addTimer
			,"+Add Timer" 
			,"Add New Timer"
	);
}
EventSheet.prototype.addTimer = function (data) {
	if(App.project === undefined){return false;}
	if(!App.project.addTimer(data.name)){
		alert( data.name + " exist!");
	}else{
		App.updateProjectTree();
	}
}

//------------End Timer------------//



EventSheet.prototype.getParameterName = function (type) {
	App.showInputModal({
			name:{value:"parameter" , label:"Parameter Name",type:WEBCL_IDE.TYPES.STRING}
			,value:{label:"Default Value",type:type}
			,isResult:{label:"is Result",type: WEBCL_IDE.TYPES.BOOL}
			,type:{label:"Parameter Type",type: WEBCL_IDE.TYPES.TYPE}
			}
			,App.addParameter
			,"+Add Parameter" 
			,"Add New Parameter"
	);
}
EventSheet.prototype.addParameter = function (data) {
	if(App.project === undefined){return false;}
	
	if(!App.project.addParameter(data.name, data.type, data.value, data.isResult)){
		alert( data.name + " exist!");
	}else{
		App.updateProjectTree();
	}
}


EventSheet.prototype.getSourceName = function () {
	App.showInputModal(
			{"name":{"value":"name" , "label" : "Source Name" , "type" : WEBCL_IDE.TYPES.STRING}}
			,App.addSource
			,"+Add Source" 
			,"Add New WebCL Source "
	);
}
EventSheet.prototype.addSource = function (data) {
	if(App.project === undefined){return false;}
	if(!App.project.addSource(data.name , "cl" , "")){
		alert( data.name + " exist!");
	}else{
		App.updateProjectTree();
	}
}


//---------------------------Project -------------------------//

EventSheet.prototype.getNewProjectName = function () {
	App.showInputModal(
			{"name":{"value":"newProject" , "label" : "Project Name" , "type" : WEBCL_IDE.TYPES.STRING}}
			,App.createProjectEvent
			,"+New Project" 
			,"Create New Project"
	);
}

EventSheet.prototype.createProjectEvent = function (data) {
	var p = new Project();
	p.create(data.name);
	App.project = p;
	App.updateProjectTree();
	var json = p.save();
	console.log(json);
}

//------------End Project------------//


//------------------------------Show Input Modal --------------------------------------/

EventSheet.prototype.showInputModal = function (data , callback ,  okLabel , title) {
	//Checking parameters
	var modal = $(App.ID.inputModal);
	if(modal.hasClass('in')){return false;}//if modal is visible return false
	if(data === undefined){return false;}
	if(callback === undefined){return false;}
	if(title === undefined){title = "Input Data";}
	if(okLabel === undefined){okLabel = "OK";}
	
	//Adding title and get body
	$(App.ID.inputModalTitle).text(title);
	var body = modal.find(".modal-body");
	var html = "";
	
	//Create input elements
	for(var name in data){
		var id = App.ID.inputModal.slice(1) + "-data-" + name;
		html += App.utils.types2Input(id, data[name].label, data[name].type, data[name].value);
		data[name].id = '#' + id;
	}
	//Add input elements into body
	body.html("<form role='form'>" + html + "</form>");
	
	//Add OKButton
	var okButton = $('<button/>',{
		id : App.ID.inputModalOKB.slice(1),
		'class' : 'btn btn-primary',
		text: okLabel,
		click: function () {
			var obj = new Object();
			for(var name in data){
				var value = App.utils.input2value(data[name].id,data[name].type);
				obj[name] = value;
			}
			modal.modal("hide");
			callback(obj);
		}
	});

	$(App.ID.inputModalOKB).remove();
	modal.find(".modal-footer").append(okButton);
	
	//Show modal
	modal.modal('show');
}

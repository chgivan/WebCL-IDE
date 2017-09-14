function ProjectTree(project){
	this.project = project;
	
}

//=============Project Tree==============
ProjectTree.prototype.callBackContextMenuTree = function($node){
	return {
		"Create": {
			"label": "New",
			"action": false,
			"submenu" :{
				"addTimer" :{
					"label" : "Timer",
					action : function (obj) {App.getTimerName();}	
				}
				,"addParameter":{
					"label" : "Parameter",
					action : function (obj) {App.getParameterName(WEBCL_IDE.TYPES.STRING);}	
				}
				,"addSource":{
					"label" : "WebCL source",
					action : function (obj) {App.getSourceName();}	
				}
			}
		}
	};
}


ProjectTree.prototype.initProjectTree = function(){
	$(this.ID.projectTree).jstree({
		"plugins": ["contextmenu"],
		"contextmenu": {
			"items": this.callBackContextMenuTree
		}
	});
	$(this.ID.projectTree).delegate("a","dblclick", function(e) {
		//Doublie click Node jtree
	});
}

ProjectTree.prototype.updateProjectTree = function(){
	if(App.project === undefined){return false;}
	var data = new Array();
	data.push({id:'root',parent:'#',text:App.project.name,state:{disable:true,opened:true}});

	//Sources to tree
	data.push({id:'src',parent:'root',text:'src',state:{disable:true,opened:true}});
	var sources =  App.project.sources;
	for(var i = 0 ; i < sources.length ; i++){
		data.push({id:'src-' + sources[i].name,parent:'src',text:sources[i].name +"."+ sources[i].type,state:{disable:true}});
	}
	//Timers to tree
	data.push({id:'timers',parent:'root',text:'Timers',state:{disable:true,opened:true}});
	var timers =  App.project.timers;
	for(var i = 0 ; i < timers.length ; i++){
		data.push({id:'timers-' + timers[i],parent:'timers',text:timers[i],state:{disable:true}});
	}
	//Parameters to tree
	data.push({id:'parameters',parent:'root',text:'Parameters',state:{disable:true,opened:true}});
	var parameters =  App.project.parameters;
	for(var i = 0 ; i < parameters.length ; i++){
		data.push({id:'parameters-' + timers[i],parent:'parameters',text:parameters[i],state:{disable:true}});
	}

	$(this.ID.projectTree).jstree(true).settings.core.data = data;
	$(this.ID.projectTree).jstree(true).refresh();
}
function GUI(){
	this.ID = { 
			projectTree : "projectTree"
			,inputForm : "inputForm"
			,inputLabel:"inputForm-inputLabel"
			,inputText:"inputForm-inputText"
			,inputError:"inputForm-error"
			,explorerTab:"explorerTab"
			,contentTab:"contentTab"
			,basicModal:"basicModal"
	};
	this.selectors = {};
	for(var key in this.ID){
		this.selectors[key] = "#"+this.ID[key];
	}

	this.init();
};
GUI.prototype.init = function(){
	//NavDiv
	this.explorerTabs = new Tabs(this.ID.explorerTab);
	this.explorerTabs.addTab("project" , "Project");
	this.explorerTabs.addTab("webcl" , "WebCL");
	var tab = this.explorerTabs.findTab("project");
	$("#"+ tab.body).html("<div id="+this.ID.projectTree+"></div>");
	this.explorerTabs.showTab("project");
	
	this.projectTree = new ProjectTree(this.ID.projectTree);
	
	//MainDiv
	this.contentTab = new Tabs(this.ID.contentTab);
} 


//============= Modal=====================//
//data [{type:"label",value:"Test"}]
GUI.prototype.showModal = function (id , data) {
	//Checking parameters
	var modal = $(this.selectors.basicModal);
	if(modal.hasClass('in')){return false;}//if modal is visible return false

	if(id === undefined){return false;}
	if(data === undefined){data = [];}
	
	//Reset Modal
	modal.find(".okButton").remove();
	modal.find(".myerror").text("");
	
	$("#"+id)[0].reset();
	

	modal.find(".modal-body").append($("#"+id));
	var returnCallback = false;
	for(var i =0 ; i < data.length ; i++){
		var obj = data[i];
		if(obj.type == "label"){
			var element = $(obj.selector);
			element.text(obj.value);
		}else if(obj.type == "title"){
			modal.find(".modal-title").text(obj.value);
		}else if(obj.type == "text"){
			var element = $(obj.selector);
			element.val(obj.value);
		}else if(obj.type == "okButton"){
			var okButton = $('<button/>',{
				'class' : 'btn btn-primary okButton',
				text: obj.value,
				click: obj.callback
				});
			modal.find(".modal-footer").append(okButton);
			returnCallback = obj.callback;
		}
	}
	if(returnCallback){
		$("#"+id).submit(function(e){returnCallback();return false;});
	}else{
		$("#"+id).submit(function(e){return false;});
	}
	//Show modal
	modal.modal('show');
}

GUI.prototype.hideModal = function (id) {
	var modal = $(this.selectors.basicModal);
	if(!modal.hasClass('in')){return false;}//if modal is not visible return false
	
	modal.modal("hide");
}

//=============End input modal==============

//=============Tabs==========================
function Tabs(id){
	this.id = id;
	this.selector = "#"+id;
	this.tabsDiv = $(this.selector); 

	this.headerID = id + "-h";
	this.headerSelector = "#"+this.headerID;

	this.bodyID = id + "-b";
	this.bodySelector = "#"+this.bodyID;
	this.init();
}

Tabs.prototype.init = function () {
	this.tabs = {};
	$("<ul>",{
		id:this.headerID,
		"class":"nav nav-tabs"
	}).appendTo(this.selector);
	this.headerUL = $(this.headerSelector);
	$("<div>",{
		id:this.bodyID,
		"class":"tab-content"
	}).appendTo(this.selector);
	this.bodyDiv = $(this.bodySelector);
}
Tabs.prototype.showTab = function (name) {
	var tab = this.findTab(name);
	if(tab){$('#'+tab.id).tab('show')};
}

Tabs.prototype.findTab = function (name) {
	name = name.toLowerCase();
	if(this.tabs.hasOwnProperty(name)){return this.tabs[name];}
	return false;
}

Tabs.prototype.addTabContent = function (name , content) {
	var tab = this.findTab(name);
	if(!tab){return false;}
	$("#"+ tab.body).append(content);
}

Tabs.prototype.addTab = function (name , label , closeJS) {
	if(name === undefined){return false;}
	name = name.toLowerCase();
	if(label === undefined){label = name;}
	if(closeJS === undefined){closeJS = false;}

	var idTab =  this.headerID + "-" + name;
	var idbody = this.bodyID + "-" + name;

	var closeHtml = "";
	if(closeJS){
		closeHtml = "<span class='close' onclick='"+closeJS+"'>x</span>"
	}

	var liHtml = "<li role='presentation' class='explorerTabs'>" 
		+"<a href='#"+idbody+"' id='"+idTab+"' role='tab' aria-controls='"+idbody+"' data-toggle='tab'>"
		+label+closeHtml
		+"</a></li>";
	$(this.headerSelector).append(liHtml);

	var divHtml = "<div role='tabpanel' class='tab-pane' id='"+idbody+"'></div>";
	$(this.bodySelector).append(divHtml);

	this.tabs[name] = {id:idTab ,body:idbody};

}

Tabs.prototype.removeTab = function (name) {
	name = name.toLowerCase();
	var tab = this.findTab(name);
	if(!tab){return false;}
	$("#"+ tab.id).remove();
	$("#"+ tab.body).remove();
	delete this.tabs[name];
	$(this.headerSelector + ' a:last').tab('show') // Select last tab
}
//=============End Tabs==============

//=============Project Tree==============
function ProjectTree(id){
	this.id = id;
	this.selector = "#"+this.id;
	this.init();
}
ProjectTree.prototype.contextMenuTree = function(node){
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
		,"Delete":{
			"label": "Delete",
			"action": function (obj) {
				if(node.parent == "timers"){
					App.removeTimerEvent(node.text);
				}else if(node.parent == "src"){
					var name = node.id.replace("src-", "");
					App.removeSourceEvent(name);
				}
			}
		}
	};
}
ProjectTree.prototype.init = function(){
	 this.tree = $(this.selector).jstree({
		"plugins": ["contextmenu"],
		"contextmenu": {
			"items": this.contextMenuTree
		}
	})[0];
	$(this.selector).delegate("a","dblclick", this.dbclick);
}
ProjectTree.prototype.dbclick = function(e){
	var id = $(App.gui.projectTree.selector).jstree('get_selected')[0];
	if(id.startsWith("src-")){
		var name = id.replace("src-", "");
		App.addContentTabEvent(name, e.target.text);
	}
}
ProjectTree.prototype.update = function(){
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

	$(this.selector).jstree(true).settings.core.data = data;
	$(this.selector).jstree(true).refresh();
}
//=============End Project Tree ==============
//=============Start Editor==============
function Editor(id){
	this.id = id;
	this.selector = "#"+id;
	this.init();
}
Editor.prototype.init = function(){
	 this.textArea = $("<textarea />",{
		id:this.id
	})[0];
}
Editor.prototype.setBody = function(text){
	this.textArea.value = text;
}
Editor.prototype.getBody = function(){
	return this.textArea.value;
}
//=============End Editor==============
function EventSheet(){
	this.gui = new GUI();
	this.project = undefined;
	this.data = new Data(); 
};

//Main function
$(function () {
	window.App = new EventSheet();
	window.Utils = new Utils();
});


EventSheet.prototype.runScript = function (event) {
	event.preventDefault(); // To prevent following the link (optional)
	//App.execute();


	/*
	var a = new Project();
	var b = new Project();
	a.create("test");
	a.addParameter("x" , WEBCL_IDE.TYPES.INT , 10);
	if(a.addParameter("X" , 0 , 10)){
		console.log("Added parameter");
	}else{
		console.log("parameter exist ");
	}
	console.log(a);
	var json = a.save();
	console.log(json);
	b.load(json);
	console.log(b);
	 */
};





//--------------------------- Tabs -------------------------//



EventSheet.prototype.test = function () {
	App.gui.showModal(this.gui.ID.inputForm,[
	{type:"title",value:"Test"},
	{type:"label",selector:this.gui.selectors.inputLabel,value:"Insert text:"},
	{type:"text",selector:this.gui.selectors.inputText,value:"test"},
	{type:"okButton",callback:App.FireTest1,value:"OK"}
	]);
}

EventSheet.prototype.FireTest1 = function () {
	alert("fsafsa");
	
	App.gui.hideModal();
}

//---------------------------End Tabs -------------------------//
//---------------------------Project -------------------------//

EventSheet.prototype.loadProjectEvent = function (json) {
	var p = new Project();
	p.load(json);
	App.project = p;
	App.updateProjectTree();
}

EventSheet.prototype.getNewProjectName = function () {
	App.gui.showModal(this.gui.ID.inputForm,[
		{type:"title",value:"Create New Project"},
		{type:"label",selector:this.gui.selectors.inputLabel,value:"Project Name:"},
		{type:"text",selector:this.gui.selectors.inputText,value:"newProject"},
		{type:"okButton",callback:App.createProjectEvent,value:"+New Project"}
 	]);
}

EventSheet.prototype.createProjectEvent = function () {
	var name = $(App.gui.selectors.inputText).val();
	if(!name.isEmpty()){
		App.project = new Project(name);
		App.project.addTimer("total");
		App.project.addSource("main","js" , "");
		App.gui.projectTree.update();
		
		
		App.gui.hideModal();
	}else{
		$(App.gui.selectors.inputError).text("*Project name much not be empty!!");
	}
}

EventSheet.prototype.exportProjectEvent = function () {
	if(App.project === undefined){alert("No project found!!");return false;}
	var zip = new JSZip();
	for(var key in App.data.getData()){
		zip.file("buffers/"+key ,App.data.get(key).buffer);
	}
	zip.file("project.json" ,App.project.output());
	var blob = zip.generate({type:"blob"});
	saveAs(blob, App.project.name+".zip");	
}

//------------End Project------------//

//---------------------------Source -------------------------//
EventSheet.prototype.getSourceName = function () {
	App.gui.showModal(this.gui.ID.inputForm,[
  		{type:"title",value:"Create New WebCL Source"},
  		{type:"label",selector:this.gui.selectors.inputLabel,value:"Source Name:"},
  		{type:"text",selector:this.gui.selectors.inputText,value:"newSource"},
  		{type:"okButton",callback:App.addSource,value:"+New Source"}
   	]);
}
EventSheet.prototype.addSource = function (data) {
	var name = $(App.gui.selectors.inputText).val();
	if(App.project === undefined){alert("Project not exist!!");return false;}
	if(!name.isEmpty()){
		var added = App.project.addSource(name, "cl", "");
		if(added){
			App.gui.projectTree.update();
			App.addContentTabEvent(name, name + ".cl");
			App.gui.hideModal();
		}else{
			$(App.gui.selectors.inputError).text("*Source already exist!!");
		}
	}else{
		$(App.gui.selectors.inputError).text("*Source name much not be empty!!");
	}
}
EventSheet.prototype.removeSourceEvent = function (name) {
	if(App.project === undefined){alert("Project not exist!!");return false;}
	if(name == "main"){
		alert("You can not delete the main!!");
		return false;
	}
	App.project.removeSource(name);
	App.removeContentTabEvent(name);
	App.gui.projectTree.update();
}
//---------------------------End Source -------------------------//
//---------------------------Timers -------------------------//
EventSheet.prototype.getTimerName = function () {
	App.gui.showModal(this.gui.ID.inputForm,[
 		{type:"title",value:"Create New Timer"},
 		{type:"label",selector:this.gui.selectors.inputLabel,value:"Timer Name:"},
 		{type:"text",selector:this.gui.selectors.inputText,value:"newTimer"},
 		{type:"okButton",callback:App.addTimerEvent,value:"+New Timer"}
  	]);
}
EventSheet.prototype.addTimerEvent = function () {
	var name = $(App.gui.selectors.inputText).val();
	if(App.project === undefined){alert("Project not exist!!");return false;}
	if(!name.isEmpty()){
		var added = App.project.addTimer(name);
		if(added){
			App.gui.projectTree.update();
			App.gui.hideModal();
		}else{
			$(App.gui.selectors.inputError).text("*Timer already exist!!");
		}
	}else{
		$(App.gui.selectors.inputError).text("*Timer name much not be empty!!");
	}
}
EventSheet.prototype.removeTimerEvent = function (name) {
	if(App.project === undefined){alert("Project not exist!!");return false;}
	if(name == "total"){
		alert("You can not delete the total time!!");
		return false;
	}
	App.project.removeTimer(name);
	App.gui.projectTree.update();
}
//------------------------End Timers -------------------------//
//-----------------------Content Tabs Events-----------------//
EventSheet.prototype.addContentTabEvent = function (name , label) {
	var tab = App.gui.contentTab.findTab(name)
	if(!tab){//Create tab if not exist
		App.gui.contentTab.addTab(name , label , "App.removeContentTabEvent(\""+name+"\")");
	}
	App.gui.contentTab.showTab(name);
}
EventSheet.prototype.removeContentTabEvent = function (name) {
	App.gui.contentTab.removeTab(name);
}
//--------------------End Content Tabs Events-----------------//
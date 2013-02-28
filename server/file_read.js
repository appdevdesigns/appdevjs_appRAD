////
//// File List
////
//// Performs the actions for displaying the file.
////
////    /appRAD/editor 
////
////

var fs = require('fs');

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;


var appRADFileEditorList = new AD.App.Service({});
module.exports = appRADFileEditorList;


////---------------------------------------------------------------------
var hasPermission = function (req, res, next){
	//Verify the current viewer has permission to perform this action.
	next();
}

////---------------------------------------------------------------------
var verifyParams = function (req, res, next){
	var listRequiredParams = ['module', 'page', 'file'];
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
}

////---------------------------------------------------------------------
var gatherList = function(req, res, next){
	var moduleName = req.param('module');
	var pageName = req.param('page');
	var fileName = req.param('file');
	var fileType = req.param('file').split('.');
	var path = '';
	if (fileType[1] == 'js'){
		path = __appdevPath + '/modules/' + moduleName + '/web/pages/' + pageName + '/scripts/'+fileName;
	} else {
		path = __appdevPath + '/modules/' + moduleName + '/web/pages/' + pageName + '/views/'+fileName;
	}
	templateTool.fileRead(path, function(err,list) {
		if (err) {
			// return error message to browser
            AD.Comm.Service.sendError(req, res, {
                success: 'false',
                errorID:'150',
                errorMSG:'Error reading path['+path+']: '+err,
                data:{}
            }, AD.Const.HTTP.ERROR_NOTFOUND);
		} else {
			var file = [];
			file.push({id:fileName,fileContent:list});
			req.aRad = {};
			req.aRad.data = file; 
			next();
		}
	});
}

var publicLinks = {
		findOne: 	{method:'GET', uri:'/[moduleName]/file', params:{module:'[module]', page:'[page]', file:'[file]'}, type:'resource'},
		update:		{method:'PUT', uri:'/[moduleName]/file/[id]', params:{module:'[module]', page: '[page]', file: '[file]', content:'[content]'}, type:'action'}
}

var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({});

var editorStack = [
       AD.App.Page.serviceStack, // authenticates viewer, and prepares req.aRAD obj.
       hasPermission,			 // make sure we have permission to access this
       verifyParams,			//  make sure our required Params are given
       gatherList
    ];


appRADFileEditorList.setup = function(app) {
	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/file', editorStack, function(req, res, next){
		//test using: http://localhost:8088/appRAD/editor
		
		// By the time we get here, all the processing has taken place.
		
		logDump(req, 'finished editors....');
		
		// send a success message
		AD.Comm.Service.sendSuccess(req, res, req.aRad.data );
		
	});
	
	var data = {moduleName:this.module.name()};
	for (var a in publicLinks){
		var entry = publicLinks[a];
		publicLinks[a].uri = AD.Util.String.render(entry.uri,data);
	}
	
	////Register the public site/api
	var definition = {
		module:this.module.name(),
		resource:'file'
	}
	AD.Util.Service.registerAPI(definition, publicLinks);
	
}
////
//// File Update
////
//// This service is created to handle requests to update new Controller
//// files for a Page.
////
////	/appRAD/editor/update	
////
////
////

var $ = AD.jQuery;
var log = AD.Util.Log;
var logDump = AD.Util.LogDump;


var appRADFileUpdate = new AD.App.Service({});
module.exports = appRADFileUpdate;


var hasPermission = function (req, res, next){
	// Verify the current viewer has permission to perform this action
	next();
}

var verifyParams = function(req, res, next){
	var listRequiredParams = ['module', 'page', 'file', 'content'];
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
}

var validateParams = function(req, res, next){
	var module = req.param('module');
	var page   = req.param('page');
	var file = req.param('file');
	var fileType = req.param('file').split('.');
	var path = '';
	if (fileType[1] == 'js'){
		path = __appdevPath + '/modules/' + module + '/web/pages/' + page + '/scripts/'+file;
	} else {
		path = __appdevPath + '/modules/' + module + '/web/pages/' + page + '/views/'+file;
	}
	fs.exists(path, function(isThere){
		
		if (!isThere) {
			 // directory doesn't exist, this is a problem!
	        var msg = 'provided path with file ['+path+'] does not exist.';
	        logDump(req, '  - error: ' + msg);

	        AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

		} else {
			next();
		}
	});
}

var updateFile = function(req, res, next){
	var moduleName = req.param('module');
	var pageName = req.param('page');
	var file = req.param('file');
	var fileType = req.param('file').split('.');
	var path = '';
	if (fileType[1] == 'js'){
		path = __appdevPath + '/modules/' + moduleName + '/web/pages/' + pageName + '/scripts/'+file;
	} else {
		path = __appdevPath + '/modules/' + moduleName + '/web/pages/' + pageName + '/views/'+file;
	}
	var content = req.param('content');
	templateTool.fileWrite(path, content, function(err, list){
		if (err) {
			//return error message to browser
			AD.Comm.Service.sendError(req, res, {
				success: 'false',
				errorID: '150',
				errorMSG: 'Error writing path['+path+']: '+err,
				data:{}
			},	AD.Const.HTTP.ERROR_NOTFOUND);
		} else {
			next();
		}
	});
}

var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({});

var fileStack = [
    AD.App.Page.serviceStack, //authenticates viewer, and prepares req.aRAD object.
    hasPermission,		// make sure we have permission to access this
    verifyParams,		// make sure all required params are given
    validateParams,	    
    updateFile			// update file
    ];


appRADFileUpdate.setup = function(app){

	var __this = this;
	
	app.put('/'+this.module.name()+'/file/:id', fileStack, function(req, res, next) {
		
		logDump(req, 'finished put /'+__this.module.name()+'/file/[id]');
		
		var successStub = {
				message:'done.'
		}
		AD.Comm.Service.sendSuccess(req, res, successStub);
		
	});
}
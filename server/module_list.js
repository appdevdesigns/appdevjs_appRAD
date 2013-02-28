
////
//// Module List
////
//// Performs the actions for module.
////
////    /appRAD/module/list 
////
////

var fs = require('fs');

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;


//the AppRADInfo object:  manages the .appRAD.info file
var AppRADInfo = require('./objects/appRADInfo.js');


var appRADModuleList = new AD.App.Service({});
module.exports = appRADModuleList;





////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.module.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 Forbidden
    // end if

}



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the directory names under appdev/modules/*

    var path = __appdevPath+'/modules';
    templateTool.listDirNames(path, function(err, list) {
        // if err then
        if (err) {
            // return error message to browser
            AD.Comm.Service.sendError(req, res, { 
                success: 'false',
                errorID:'150',
                errorMSG:'Error reading path['+path+']: '+err,
                data:{}
            }, AD.Const.HTTP.ERROR_NOTFOUND);
        } else{ 
            // package the file info into an array of filenames
            req.aRad = {};
            req.aRad.listFiles = list;
            next();
        }
    });

}






////---------------------------------------------------------------------
var details = function (req, res, next) {
	// we have a simple list, but we need to fill out each of the details
	
	var listFiles = req.aRad.listFiles;
	var detailList = [];
	
	var mergeFields = ['iconPath'];  // there is alot of info in appRADInfo.data().  only include these fields.
	for (var l=0; l<listFiles.length; l++) {
		
		var entry = listFiles[l];
		
		var appRADInfo = new AppRADInfo(listFiles[l].id);
		var data = appRADInfo.data();
		
		// some modules don't have an .appRAD.info so skip
		if (data != null) {
			
			// merge desired fields
			for(var m=0; m<mergeFields.length; m++) {
				var key = mergeFields[m];
				if ('undefined' != typeof data[key]) {
					entry[key] = data[key];
				}
			}
		}
		 
		
		detailList.push(entry);
	}
	
	req.aRad.listFiles = detailList;
	next();

}



/*
 * Template:
 * Modules can:
 * 	list/
 * 	create/
 * 
 * modules have additional resources:
 * 	pages/
 * 	models/
 * 	install.sql
 * 	install.labels
 * 
I think our framework should be able to tell a model the basic URI formats:
create: /[moduleName]/[modelName]   post
update: /[moduleName]/[modelName]/[id]  post
destroy: /[moduleName]/[modelName]/[id]  del
find: /[moduleName]/[modelName]/[id] get
findAll: /[moduleName]/[modelName]s  get 

so...  
[siteURL]/api/[moduleName]
response:
{
	[modelName]: {  create: {}, update: {}, destroy:{}, find:{}, findAll:{} }
	[modelName]: {},
	[modelName]: {}
}

clientSide: 
AD.Model.Urls = fn( modelName) { return AD.Model.urls[modelName]; }


now individual modules can provide:
	{
		// basic javascriptMVC operations:

		update:{},
//		destroy:{}, // individual resources could normally provide this. But not Modules (yet)
		find:{},  // should we name this 'self'  ?

		
		// additional related resources: (should return related resources)
		pages:{ method:'GET', uri:'/appRAD/module/[id]/pages' params={} },
		models:{ method:'GET', uri:'/appRAD/module/[id]/models' params={} },
		install.sql:{}
		install.labels:{}
		
	}
	
	
 */

var moduleActions = {
	update: { method:'POST', uri:'/[moduleName]/module/[id]', params:{}, type:'action' },
	self:   { method:'GET',  uri:'/[moduleName]/module/[id]', params:{}, type:'resource' },
    pages:  { method:'GET',  uri:'/[moduleName]/pages', params:{module:'[module]'}, type:'resource' },
	models: { method:'GET',  uri:'/[moduleName]/module/[id]/models', params:{}, type:'resource' }	
}


//these are our publicly available /site/api/[moduleName]/module  links;
var publicLinks = {
		findAll: { method:'GET', uri:'/[moduleName]/modules', params:{}, type:'resource' },
		findOne: { method:'GET',  uri:'/[moduleName]/module/[id]', params:{}, type:'resource' },
		create:  { method:'POST',  uri:'/[moduleName]/module', params:{name:'[name]'}, type:'action' },
		update: moduleActions['update']	
}



////---------------------------------------------------------------------
var addActions = function (req, res, next) {
	// now we have our list, let's add possible actions to each element

	var listFiles = req.aRad.listFiles;
	
	var modifiedList = AD.Util.Service.applyLinks(listFiles,moduleActions);

	req.aRad.listFiles = modifiedList;
	next();

}




////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});



var moduleStack = [
        AD.App.Page.serviceStack,	// authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      		// make sure we have permission to access this
        gatherList, 				// get a list of all moduels
        details,					// get the module details ...
        addActions					// for each result, package them with their HATEOS actions
    ];
        
var totalCount = 0;


appRADModuleList.setup = function(app) {
	
	
	// update our urls to use our module.name()
	var data = {moduleName:this.module.name()};
	for (var a in moduleActions){
		var entry = moduleActions[a];
		moduleActions[a].uri = AD.Util.String.render(entry.uri, data); //entry.uri.replace('[moduleName]', this.module.name());
	}


	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/modules', moduleStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/module/list
	
	
	    // By the time we get here, all the processing has taken place.
		totalCount++;
		
	    logDump(req, 'finished module/list ['+totalCount+']');
	    
	   
	    
	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.listFiles );
	    
	});
	
	
	this.setupSiteAPI('module', publicLinks);
	/*
	for (var a in publicLinks){
        var entry = publicLinks[a];
        publicLinks[a].uri = AD.Util.String.render(entry.uri, data); //entry.uri.replace('[moduleName]', this.module.name());
    }
	
	//// Register the public site/api
	var definition = { 
        module:this.module.name(),
        resource:'module'
    }
    AD.Util.Service.registerAPI(definition, publicLinks);
    */
}

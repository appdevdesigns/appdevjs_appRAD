
////
//// Server Api List
////
//// Performs the actions for script.
////
////    /appRAD/serverapi/list 
////
////

var fs = require('fs');

var $ = AD.jQuery;
var log = AD.Util.Log;
var logDump = AD.Util.LogDump;



var appRADServerApiList = new AD.App.Service({});
module.exports = appRADServerApiList;





////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.model.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['module']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // Make sure provided parameters are valid.
    
    var module = req.param('module');
    var path = __appdevPath + '/modules/' + module;
    fs.exists(path, function(isThere) {
     
        if ((!isThere) || (module == '')) {
            
            // directory doen't exists, this is a problem!
            var msg = 'provided Module Name ['+module+'] does not exists.';
            logDump(req, '  - error: ' + msg);
        
        
            AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
        
            
        } else {
            
            // it's there so we can continue.
            next();
        }
    });
};



var parseAttributes = function(field,startText,endText){
	var startPosition = field.indexOf(startText)+startText.length;
	var length = field.indexOf(endText,startPosition) - startPosition +1;
	var value = field.substr(startPosition,length-1).replace(/\s/g, '').toLowerCase();
	return value;
}

var createObject = function(req,path,listOfFileNames){
	var dfd = $.Deferred();
	var listObjects = [];
	var objectsTotal = listOfFileNames.length;
	var objectsCount = 0;
	for(var i=0;i< listOfFileNames.length;i++){
		var fileName = listOfFileNames[i].name;
		
		var readIt = function(fileName) {
		    
    	    templateTool.fileRead(path+fileName, function(err,list) {
    	    	var fileContents = list;
    	    	var resourceName = parseAttributes(fileContents,'@apprad resource:',' // @appradend');
    	    	var actionName =  parseAttributes(fileContents,'@apprad action:',' // @appradend');
    //	    	var fileName = 'api_'+resourceName+'_'+actionName+'.js';
    	    	var urlName = parseAttributes(fileContents,'@apprad url:',' // @appradend');
    	    	object = {
    				name: fileName,
    				resource: resourceName,
    				action: actionName,
    				url: urlName
    	    	};
    	    	listObjects.push(object);
    	    	objectsCount ++;
    	        if (objectsCount >= objectsTotal) {
    	            // Return empty list
    	            req.aRad = {};
    	            req.aRad.list = listObjects;
    	            dfd.resolve();
    	        }
    	    });
	    
		} // readIt()
		readIt(fileName);
		
	}
	return dfd;
}


////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the file names under .../moduleName/models/*
	var listObjects = [];
    var moduleName = req.param('module');
    if (moduleName) {
        var path = __appdevPath+'/modules/'+moduleName+'/server/api/';
        templateTool.listFileNames(path, function(err, list) {
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
                var createDone = createObject(req,path,list);
                $.when(createDone).then(function(data){  
                	// everything ok, so continue
                	next();
                }).fail(function(err){
            
                	// return the error message
                	AD.Comm.Service.sendError(req, res, {error:err}, AD.Const.HTTP.ERROR_SERVER ); // 500
                });
            }
        });
    } else {
        // No module or invalid module provided
        // Return empty list
        req.aRad = {};
        req.aRad.list = [];
        next();
    }
}

//these are our publicly available /site/api/[moduleName]/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/[moduleName]/serverapi', params:{module:'[module]'}, type:'resource' },
        findOne: { method:'GET',  uri:'/[moduleName]/serverapi/[id]', params:{module:'[module]'}, type:'resource' },
        create:  { method:'POST',  uri:'/[moduleName]/serverapi', params:{module:'[module]', resource:'[resourceName]', action:'[action]', url:'[url]'}, type:'action' },
        update:  { method:'PUT', uri:'/[moduleName]/serverapi/[id]', params:{module:'[module]'}, type:'action' } 
}


////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});


var serverapiStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,       // make sure our required Params are given
        validateParams,     // make sure given params are valid
        gatherList  		// get a list of all files
        //createObject		// create object of files
    ];
        


appRADServerApiList.setup = function(app) {

	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/serverapi', serverapiStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/model/list
	
	
	    // By the time we get here, all the processing has taken place.

	    logDump(req, 'finished server api ...');

	    
	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.list );
	    
	});
	
	
	
	// update our urls to use our module.name()
	var data = {moduleName:this.module.name()};
    for (var a in publicLinks){
        var entry = publicLinks[a];
        publicLinks[a].uri = AD.Util.String.render(entry.uri, data); //entry.uri.replace('[moduleName]', this.module.name());
    }
	
	
    ////Register the public site/api
	var definition = { 
        module:this.module.name(),
        resource:'serverapi'
	}
	AD.Util.Service.registerAPI(definition, publicLinks);
	
}
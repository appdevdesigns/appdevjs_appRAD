
////
//// Page List
////
//// Performs the actions for page.
////
////    /appRAD/pages 
////
////

var fs = require('fs');

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;



var appRADPageList = new AD.App.Service({});
module.exports = appRADPageList;





////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.page.list' action/permission
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
            
            // directory doesn't exist, this is a problem!
            var msg = 'provided Module Name ['+module+'] does not exist.';
            logDump(req, '  - error: ' + msg);
        
        
            AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
        
            
        } else {
            
            // it's there so we can continue.
            next();
        }
    });
};



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the directories under .../moduleName/web/pages/*
    var moduleName = req.param('module');
    if (moduleName) {
        var path = __appdevPath+'/modules/'+moduleName+'/web/pages';
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
    } else {
        // No module or invalid module provided
        // Return empty list
        req.aRad = {};
        req.aRad.listFiles = [];
        next();
    }

}

//these are our publicly available /site/api/[moduleName]/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/[moduleName]/pages', params:{module:'[module]'}, type:'resource' },
        findOne: { method:'GET',  uri:'/[moduleName]/page/[id]', params:{module:'[module]'}, type:'resource' },
        create:  { method:'POST',  uri:'/[moduleName]/page', params:{module:'[module]', page:'[page]'}, type:'action' },
        update:  { method:'POST', uri:'/[moduleName]/page/[id]', params:{module:'[module]'}, type:'action' } 
}


////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});


var pageStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,       // make sure our required Params are given
        validateParams,     // make sure given params are valid
        gatherList 			// get a list of all files
    ];
        


appRADPageList.setup = function(app) {

    
	////---------------------------------------------------------------------
	app.all('/'+this.module.name()+'/pages', pageStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/pages
	
	
	    // By the time we get here, all the processing has taken place.

	    logDump(req, 'finished pages ...');

	    
	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.listFiles );
	    
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
        resource:'page'
	}
	AD.Util.Service.registerAPI(definition, publicLinks);

}
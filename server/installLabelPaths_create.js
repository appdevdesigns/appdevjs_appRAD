
////
//// InstallLabelPaths
////
//// Performs the actions for installLabelPaths.
////
////    /'+this.module.name()+'/installLabelPath
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;

var AppRADInfo = require('./objects/appRADInfo.js');


var appRADInstallLabelPaths = new AD.App.Service({});
module.exports = appRADInstallLabelPaths;



////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.installLabelPaths.create' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['module', 'path']; // each param is a string
	/*
	 {
	     'module': [ 'exists', 'notPath', 'emailType', 'validNumber', { op:'!=', value:"[module]" } ]
	     'path': ['exists' ]
	 }
	 */
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    var module = req.param('module');
    if (module == '[module]') {
        var errorData = { message:'missing param: module' };
        AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_CLIENT ); // 400 : missing params
        return;
    }
    
    var path = req.param('path');
    if (path == '[path]') {
        var errorData = { message:'missing param: path' };
        AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_CLIENT ); // 400 : missing params
        return;
    }
    
    // must be ok if we get here.
    next();
};



////---------------------------------------------------------------------
var addPath = function (req, res, next) {
    // add Path to our list.

    var module = req.param('module');
    var path = req.param('path');
    
    
    var appRADInfo = new AppRADInfo(module);

    
    var data = appRADInfo.data();
    
    data.labels.installed[path] = path;
    
    
    var updated = appRADInfo.update(data);
    $.when(updated)
        .then(function(data){
                next();
            })
        .fail(function(err){
            
            AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_SERVER ); // 500 : our problem
        });

};




// these are our publicly available /site/api/appRAD/module  links;
var publicLinks = {
        create:  { method:'POST',  uri:'/appRAD/installLabelPath', params:{module:'[module]', path:'[path]'}, type:'action' },
}



var installLabelPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        validateParams,     // make sure params are valid 
        addPath,            // add label path to our list
    ];
        


appRADInstallLabelPaths.setup = function( app ) {

	
	////---------------------------------------------------------------------
	app.post('/'+this.module.name()+'/installLabelPath', installLabelPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installLabelPath
	
	    
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished installLabelPath (create)');

	    // send a success message
	    // Model objects like to receive an {id:[primaryKey]} after a create:
	    var successStub = {
	            id:req.param('path') 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );

	    
	});
	
	
	// Register our public api links
	this.setupSiteAPI('installLabelPath', publicLinks);

} // end setup()


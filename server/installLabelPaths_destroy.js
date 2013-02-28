//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   installLabelPaths    : the name of this service :  (lowercase)
//   InstallLabelPaths    : the name of this service :  (Uppercase)
//   destroy	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')


////
//// InstallLabelPaths
////
//// Performs the actions for installLabelPaths.
////
////    /'+this.module.name()+'/installLabelPaths/destroy 
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


    // if viewer has 'appRAD.installLabelPaths.destroy' action/permission
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
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};






////---------------------------------------------------------------------
var removePath = function (req, res, next) {
    // add Path to our list.
    
    var module = req.param('module');
    var path = req.param('path');
    
    
    var appRADInfo = new AppRADInfo(module);
    
    
    var data = appRADInfo.data();
    
    if ('undefined' == typeof data.labels.installed[path]) {
        
        // send error msg:
        var errorData = { message:'Not Found: path['+path+']' };
        AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_NOTFOUND ); // 404
    
    } else {
        
        delete data.labels.installed[path];
        
        var updated = appRADInfo.update(data);
        $.when(updated)
            .then(function(data){
                    next();
                })
            .fail(function(err){
                
                AD.Comm.Service.sendError(req, res, err, AD.Const.HTTP.ERROR_SERVER ); // 500 : our problem
            });
    }



};



// these are our publicly available /site/api/appRAD/module  links;
var publicLinks = {
        destroy: { method:'PUT', uri:'/appRAD/installLabelPath/destroy', params:{module:'[module]', path:'[path]'}, type:'action' } 
}



var installLabelPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        removePath,         // remove this path
    ];
        


appRADInstallLabelPaths.setup = function( app ) {
	
	////---------------------------------------------------------------------
	app.put('/'+this.module.name()+'/installLabelPath/destroy', installLabelPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installLabelPath/destroy
	
	
	    // By the time we get here, all the processing has taken place.

	    logDump(req, 'finished installLabelPath/destroy  (path:'+req.param('path')+') ');
	    
	    
	    // publish a notification
//	    if (appRADHub != null) appRADHub.publish('test.ping', {});
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );

	});
	
	
	// Register our public api links
	this.setupSiteAPI('installLabelPath', publicLinks);

} // end setup()


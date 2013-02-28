//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   installSQLPaths    : the name of this service :  (lowercase)
//   InstallLabelPaths    : the name of this service :  (Uppercase)
//   destroy	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')


////
//// InstallLabelPaths
////
//// Performs the actions for installSQLPaths.
////
////    /'+this.module.name()+'/installSQLPath/destroy 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;

var AppRADInfo = require('./objects/appRADInfo.js');

var appRADInstallSQLTable = new AD.App.Service({});
module.exports = appRADInstallSQLTable;



////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.installSQLPath.destroy' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['module', 'table']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};






////---------------------------------------------------------------------
var removeTable = function (req, res, next) {
    // add Path to our list.
    
    var module = req.param('module');
    var table = req.param('table');
    
    
    var appRADInfo = new AppRADInfo(module);
    
    
    var data = appRADInfo.data();
    
    if ('undefined' == typeof data.sqlTables[table]) {
        
        // send error msg:
        var errorData = { message:'Not Found: table['+table+']' };
        AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_NOTFOUND ); // 404
    
    } else {
        
        delete data.sqlTables[table];
        
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
        destroy: { method:'PUT', uri:'/appRAD/installSQLTable/destroy', params:{module:'[module]', table:'[table]'}, type:'action' } 
}



var installSQLPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,             // make sure we have permission to access this
        verifyParams,		       // make sure all required params are given
        removeTable,               // remove this table
    ];
        


appRADInstallSQLTable.setup = function( app ) {
	
	////---------------------------------------------------------------------
	app.put('/'+this.module.name()+'/installSQLTable/destroy', installSQLPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installSQLPath/destroy
	
	
	    // By the time we get here, all the processing has taken place.

	    logDump(req, 'finished installSQLTable/destroy  (table:'+req.param('table')+') ');
	    
	    
	    // publish a notification
//	    if (appRADHub != null) appRADHub.publish('test.ping', {});
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );

	});
	
	
	// Register our public api links
	this.setupSiteAPI('installSQLTable', publicLinks);

} // end setup()


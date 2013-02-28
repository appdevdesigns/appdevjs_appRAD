
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
	
	var listRequiredParams = ['module', 'table']; // each param is a string
	/*
	 {
	     'module': [ 'exists', 'notPath', 'emailType', 'validNumber', { op:'!=', value:"[module]" } ]
	     'table': ['exists' ]
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
    
    var table = req.param('table');
    if (path == '[table]') {
        var errorData = { message:'missing param: table' };
        AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_CLIENT ); // 400 : missing params
        return;
    }
    
    // must be ok if we get here.
    next();
};



////---------------------------------------------------------------------
var addTable = function (req, res, next) {
    // add Table to our list.

    var module = req.param('module');
    var table = req.param('table');
    
    
    var appRADInfo = new AppRADInfo(module);

    
    var data = appRADInfo.data();
    
    data.sqlTables[table] = table;
    
    
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
        create:  { method:'POST',  uri:'/appRAD/installSQLTable', params:{module:'[module]', table:'[table]'}, type:'action' },
}



var installLabelPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        validateParams,     // make sure params are valid 
        addTable,            // add label path to our list
    ];
        


appRADInstallLabelPaths.setup = function( app ) {

	
	////---------------------------------------------------------------------
	app.post('/'+this.module.name()+'/installSQLTable', installLabelPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installSQLTable
	
	    
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished installSQLTable (create)');

	    // send a success message
	    // Model objects like to receive an {id:[primaryKey]} after a create:
	    var successStub = {
	            id:req.param('table') 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );

	    
	});
	
	
	// Register our public api links
	this.setupSiteAPI('installSQLTable', publicLinks);

} // end setup()


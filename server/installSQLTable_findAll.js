//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   installLabelPaths    : the name of this service :  (lowercase)
//   InstallLabelPaths    : the name of this service :  (Uppercase)
//   findAll	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')


////
//// InstallLabelPaths
////
//// Performs the actions for installLabelPaths.
////
////    /'+this.module.name()+'/installLabelPaths/findAll 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;


var AppRADInfo = require('./objects/appRADInfo.js');



var appRADInstallSQLTable = new AD.App.Service({});
module.exports = appRADInstallSQLTable;



////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.installLabelPaths.findAll' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['module']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};




////---------------------------------------------------------------------
var getListSQLTables = function (req, res, next) {
    // gather the current list of tables recorded for export.
    
    var module = req.param('module');
    
    var appRADInfo = new AppRADInfo(module);
    req.aRAD.infoObj = appRADInfo;
    
    var data = appRADInfo.data();
    
    if ('undefined' == typeof data.sqlTables) {
        data.sqlTables = {};
        appRADInfo.update(data);  // note: we don't track this success or failure ...
    }
    
    var list = [];
    for (var i in data.sqlTables) {
            list.push( {id:i, table:data.sqlTables[i]});
    }
    req.aRAD.listTables = list;
    
    next();

};





// these are our publicly available /site/api/appRAD/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/appRAD/installSQLTables', params:{module:'[module]'}, type:'resource' },
}



var installLabelPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        getListSQLTables,   // get the list of sql tables stored in the .appRAD.info
        
    ];


appRADInstallSQLTable.setup = function( app ) {
	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/installSQLTables', installLabelPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installSQLTables&module=appRAD
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished installSQLTables ');

	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRAD.listTables );

	});
	
	
	// Register our public api links
	this.setupSiteAPI('installSQLTable', publicLinks);

} // end setup()


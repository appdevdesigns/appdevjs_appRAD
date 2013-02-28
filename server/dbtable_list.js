
////
//// Table List
////
//// Lists available tables.
////
////    /appRAD/dbtables
////
////

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;

var DataStore = AD.Model.Datastore;


var appRADTableList = new AD.App.Service({});
module.exports = appRADTableList;






////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.model.table.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // if a dbname is provided, it must not be a placeholder value
    
    var name = req.param('dbname');
    if (name == '[dbname]') {
        
        // this is our placeholder
        var msg = 'provided DB Name ['+name+'] not valid ...';
        logDump(req, '  - error: ' + msg);
    
        AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
    
    } else {
        
        next();
    }
   
};



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the tables
    var dbName = (req.param('dbname') || AD.Defaults.dbName);
    DataStore.listTables(dbName, function(err, results, fields){
        // if err then
        if (err) {
            
            // return error message to browser
            AD.Comm.Service.sendError(req, res, {
                errorMSG:'Error retrieving table list: '+err
            }, AD.Const.HTTP.ERROR_SERVER);  // our fault?
            
        } else{ 
            
            // package the table info into an array of entries
            // The property of interest should be 'Tables_in_<dbName>'
            var list = [];
            var colName = 'Tables_in_'+dbName;
            for (var ri=0; ri < results.length; ri++) {
                var name = results[ri][colName];
                if (typeof name != 'undefined') {
                    list.push({id:name, name:name});
                }
            }

            req.aRad = {};
            req.aRad.list = list;
            next();
        }
        
    });
}


//these are our publicly available /site/api/[moduleName]/dblist  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/[moduleName]/dbtables', params:{dbname:'[dbname]'}, type:'resource' },
}


////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});


var actionStack = [
        hasPermission,      // make sure we have permission to access this
        validateParams,     // make sure dbname is valid
        gatherList 			// get a list of all files
    ];
        


appRADTableList.setup = function(app) {

	////---------------------------------------------------------------------
	app.all('/'+this.module.name()+'/dbtables', actionStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/model/tables/list?dbName=trunk_site
	
	
	    // By the time we get here, all the processing has taken place.
		
	    logDump(req, 'finished dbtables');
	    
	   
	    
	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.list);
	    
	});
	
	
	this.setupSiteAPI('dbtable', publicLinks);

}

////
//// Database List
////
//// Lists available databases.
////
////    /appRAD/dblist 
////
////

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;

var DataStore = AD.Model.Datastore;


var appRADDatabaseList = new AD.App.Service({});
module.exports = appRADDatabaseList;


var appRADHub = null;   // Module's Notification Center (note: be sure not to use this until setup() is called)
var appRADDispatch = null;  // Module's Dispatch Center (for sending messages among Clients)




////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.model.database.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the databases
    DataStore.listDatabases(function(err, results, fields){
        // if err then
        if (err) {
            
            // return error message to browser
            AD.Comm.Service.sendError(req, res, {
                errorMSG:'Error retrieving database list: '+err,
                data:{}
            }, AD.Const.HTTP.ERROR_SERVER); // our fault?
            
        } else{ 
            // package the database info into an array of entries
            // The property of interest should be 'Tables_in_<dbName>'
            var list = [];
            var colName = 'Database';
            for (var ri=0; ri < results.length; ri++) {
                var name = results[ri][colName];
                if (typeof name != 'undefined') {
                    // filter out 'databases' that are not meaningful
                    var dbName = name;
                    if (   (dbName == 'information_schema')
                        || (dbName == 'mysql')
                        || (dbName == 'performance_schema') ) {
                        continue;
                    }
                    list.push({id: name, name:name});
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
        findAll: { method:'GET', uri:'/[moduleName]/dblist', params:{}, type:'resource' },
}



////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});


var actionStack = [
        hasPermission,      // make sure we have permission to access this
        gatherList 			// get a list of all files
    ];
        


appRADDatabaseList.setup = function(app) {
    
    
	////---------------------------------------------------------------------
	app.all('/'+this.module.name()+'/dblist', actionStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/dblist
	
	
	    // By the time we get here, all the processing has taken place.
		
	    logDump(req, 'finished model/dblist ');
	    
	   
	    
	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.list);
	    
	});
	
	
	this.setupSiteAPI('dblist', publicLinks);
	
}


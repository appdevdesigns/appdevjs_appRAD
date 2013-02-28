
////
//// Field List
////
//// Lists available fields.
////
////    /appRAD/model/fields/list 
////
////

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;

var DataStore = AD.Model.Datastore;


var appRADFieldList = new AD.App.Service({});
module.exports = appRADFieldList;





////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.model.field.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // if a dbtable is provided, it must not be a placeholder value
    
    var name = req.param('dbtable') || '[dbtable]';
    if (name == '[dbtable]') {
        
        // this is our placeholder
        var msg = 'provided table Name ['+name+'] not valid ...';
        logDump(req, '  - error: ' + msg);
    
        AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
    
    } else {
        
        next();
    }

};



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the fields
    
    var dbName = (req.param('dbname') || AD.Defaults.dbName);
    var dbTable = req.param('dbtable');
    if (dbTable) {
        DataStore.listFields(dbName, dbTable, function(err, results, fields){
            // if err then
            if (err) {
                // return error message to browser
                AD.Comm.Service.sendError(req, res, {
                    success: 'false',
                    errorID:'150',
                    errorMSG:'Error retrieving field list: '+err,
                    data:{}
                });
            } else{ 
                // package the field info into an array of entries
                // Leave the properties alone.  They should include:
                // Field, Type, Null, Key, Default, and Extra
                
                // our final list
                var list = [];
                
                // for each entry add in an 'id' and 'name' values
                for(var r=0; r<results.length; r++) {
                    var entry = results[r];
                    entry.id = results[r].Field;
                    entry.name = results[r].Field;
                    list.push(entry);
                }
                
                
                req.aRad = {};
                req.aRad.list = list;
                next();
            }
            
        });
    } else {
        // No table or invalid table provided
        // Return empty list
        req.aRad = {};
        req.aRad.list = [];
        next();
    }
}




var publicLinks = {
        findAll: { method:'GET', uri:'/[moduleName]/dbtablefields', params:{dbname:'[dbname]', dbtable:'[dbtable]'}, type:'resource' },
}


////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});


var actionStack = [
        hasPermission,      // make sure we have permission to access this
        validateParams,     // make sure dbname & dbtable is valid
        gatherList 			// get a list of all files
    ];
        
appRADFieldList.setup = function() {
	
	////---------------------------------------------------------------------
	app.all('/'+this.module.name()+'/DBTableFields', actionStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/model/fields/list?dbName=trunk_site
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished dbtablefields ');
	    

	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.list);
	    
	});
	

    this.setupSiteAPI('DBTableField', publicLinks);
	
}

//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   labelPaths    : the name of this service :  (lowercase)
//   LabelPaths    : the name of this service :  (Uppercase)
//   findAll	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')


////
//// LabelPaths
////
//// Performs the actions for labelPaths.
////
////    /'+this.module.name()+'/labelPaths/findAll 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;



var appRADLabelPaths = new AD.App.Service({});
module.exports = appRADLabelPaths;



////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.labelPaths.findAll' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['path']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var searchDB = function (req, res, next) {
    // search for the values

    var labelPath = '%/'+req.param('path')+'/%';
    
    var labelObj = AD.Model.List['site.Labels'];
    var sql = 'SELECT DISTINCT label_path as path FROM '+AD.Defaults.dbName+'.'+labelObj.dbTable + ' WHERE label_path LIKE ?';
    var values = [ labelPath ];
    var myDB = AD.Model.Datastore.DB;

    myDB.query(sql, values, function(err, results, fields){
       
//console.log();
//console.log('results:');
//console.log(results);

        if (err) {
            AD.Comm.Service.sendError(req, res, err, AD.Const.HTTP.ERROR_SERVER ); // 500 : there was a problem with our transaction
        } else {
            
            req.aRad = {list: results};
            next();
        }

    });

};






//these are our publicly available /site/api/[moduleName]/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/[moduleName]/labelPaths', params:{path:'[path]'}, type:'resource' },
//        findOne: { method:'GET',  uri:'/[moduleName]/module/[id]', params:{}, type:'resource' },
//        create:  { method:'POST',  uri:'/[moduleName]/module', params:{name:'[name]'}, type:'action' },
//        update: moduleActions['update'] 
}


var labelPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        searchDB,           // perform the sql lookup

    ];
        


appRADLabelPaths.setup = function( app ) {
	
	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/labelPaths', labelPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/labelPaths
	
	
	    // By the time we get here, all the processing has taken place.

		
	    logDump(req, 'finished labelPaths/findAll');
	    

	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRad.list );
	    
	    
	    
	});
	
	
	
	// Register our public link api
	this.setupSiteAPI('labelPath', publicLinks);

} // end setup()


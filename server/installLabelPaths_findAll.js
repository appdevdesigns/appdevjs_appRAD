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



var appRADInstallLabelPaths = new AD.App.Service({});
module.exports = appRADInstallLabelPaths;



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
var getListLabelPaths = function (req, res, next) {
    // Make sure given data is correct.
    
    var module = req.param('module');
    
    var appRADInfo = new AppRADInfo(module);
    req.aRAD.infoObj = appRADInfo;
    
    var data = appRADInfo.data();
    
    var list = [];
    if (data.labels !== undefined) {
        for (var i in data.labels.installed) {
                list.push( {id:i, path:data.labels.installed[i]});
        }
    }
    req.aRAD.listPaths = list;
    
    next();

};





// these are our publicly available /site/api/appRAD/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/appRAD/installLabelPaths', params:{module:'[module]'}, type:'resource' },
//        findOne: { method:'GET',  uri:'/appRAD/installLabelPaths/[id]', params:{}, type:'resource' },
//        create:  { method:'POST',  uri:'/appRAD/installLabelPaths', params:{name:'[name]'}, type:'action' },
//        update:  { method:'POST', uri:'/appRAD/installLabelPaths/[id]', params:{}, type:'action' } 
}



var installLabelPathsStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        getListLabelPaths,  // get the list of label paths stored in the .appRAD.info
        
//        step2, 	// get a list of all Viewers
//        step3		// update each viewer's entry
    ];


appRADInstallLabelPaths.setup = function( app ) {
	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/installLabelPaths', installLabelPathsStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installLabelPaths
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished installLabelPaths ');

	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRAD.listPaths );

	});
	
	
	// Register our public api links
	this.setupSiteAPI('installLabelPath', publicLinks);

} // end setup()


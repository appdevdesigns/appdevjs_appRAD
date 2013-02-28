//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   module    : the name of this service :  (lowercase)
//   Module    : the name of this service :  (Uppercase)
//   info	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')


////
//// Module
////
//// Performs the actions for module.
////
////    /'+this.module.name()+'/module/info 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;

// the AppRADInfo object:  manages the .appRAD.info file
var AppRADInfo = require('./objects/appRADInfo.js');


var appRADModule = new AD.App.Service({});
module.exports = appRADModule;




////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.module.info' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
	// Make sure all required parameters are given before continuing.
	
	var listRequiredParams = [ 'moduleName' ]; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
	var moduleName = req.param('moduleName');
	var modulebase = path.join(__appdevPath,'modules');
	if (fs.existsSync(path.join(modulebase,moduleName))) {
		next();
	} else {
		var errorData = { message: 'No module info because that module doesn\'t exist'};
		AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_NOTFOUND );
	}
};



////---------------------------------------------------------------------
var isThere = function (req, res, next) {
	// check if the .appRAD info is stored in this module
	
	var moduleName = req.param('moduleName');
	
	var appRADInfo = new AppRADInfo(moduleName);
	req.aRAD.infoObj = appRADInfo;
	
	if (appRADInfo.exists()) {
		readInfo(req, res, next);
	} else {
		createInfo(req, res, next);
	}

};



////---------------------------------------------------------------------
var readInfo = function (req, res, next) {
	// module currently has a .appRAD.info file so read it:
	
	log(req, 'reading .appRAD.info file');
	
	var infoObj = req.aRAD.infoObj;
	
	// store our info data for later
	req.aRAD.data = infoObj.data();

	next();
};



////---------------------------------------------------------------------
var createInfo = function (req, res, next) {
	// create the .appRAD.info for this module
	
	log(req, 'creating .appRAD.info file');
	
	var infoObj = req.aRAD.infoObj;
	
	req.aRAD.data = infoObj.newData();
	
//	infoObj.create(req, res, next);
	var created = infoObj.create();
	$.when(created)
    	.then(function(data){
    	    next();
    	})
    	.fail(function(err){
    	    var errorData = { message:'error encountered', err:err };
            AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_SERVER );
    	});
};








var moduleActions = {
		update: { method:'POST', uri:'/[moduleName]/module/[module]', params:{}, type:'action' },
		self:   { method:'GET',  uri:'/[moduleName]/module/[module]', params:{}, type:'resource' },
	}



////---------------------------------------------------------------------
var addActions = function (req, res, next) {
	// now we have our data, let's add possible actions to it.

	var data = req.aRAD.data;
	
	var modifiedData = AD.Util.Service.applyLinks(data, moduleActions);

	req.aRAD.data = modifiedData;
	next();

}






var moduleStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
		validateParams,     // make sure parameters are valid (module directory exists)
        isThere,			// is there an .appRAD.info file
// 		readInfo,			// called by isThere: read the data
//      createInfo,			// called by isThere: create the data
        addActions  		// for each result, package them with their HATEOS actions
    ];
        



appRADModule.setup = function( app ) {
	
	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/module/:moduleName', moduleStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/module/[moduleName]
	
		
	    logDump(req, 'finished module/'+req.param('moduleName'));
	    

	    AD.Comm.Service.sendSuccess(req, res, req.aRAD.data ); 
	});
	
	
	
	// update our action.uri(s) to use our module.name()
	var data = {moduleName:this.module.name()};
	for (var a in moduleActions){
		var entry = moduleActions[a];
		moduleActions[a].uri = AD.Util.String.render(entry.uri, data); 
	}
	

} // end setup()


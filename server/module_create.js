//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   module    : the name of this service :  (lowercase)
//   Module    : the name of this service :  (Uppercase)
//   add	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')


////
//// Module
////
//// Performs the actions for module.
////
////    /'+this.module.name()+'/module/add 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


var appRADModule = new AD.App.Service({});
module.exports = appRADModule;


var appRADHub = null;   // Module's Notification Center (note: be sure not to use this until setup() is called)
var appRADDispatch = null;  // Module's Dispatch Center (for sending messages among Clients)


//-----------------------------------------------------------------------------
appRADModule.initMessaging = function( app ) {
	// @param  app :  a link to the given module/interface's app object. 
	//                can be used to setup routes.
	
    // setup any handlers, subscriptions, etc... that need to have passed in 
    // private resources from the Module:
    //  this.hub = the module's Notification Hub
    //  this.listModels = the list of Model objects in the current Module
    // 
    
    appRADHub = this.module.hub;
    appRADDispatch = this.module.dispatch;
    
/*    
    var multiHandler = function(event, data) {
        console.log('multiHandler! event received['+event+']' );
    }
    appRADHub.subscribe('test.ping', multiHandler);
    AD.Comm.Notification.subscribe('test.ping', multiHandler);
*/    
    

} // end initMessaging()





////
////Setup the Model Template Definitions:
////

////NOTE: the keys in listTemplatesModel & listDestinationsModel must match.
////  

var listTemplatesModule = {
	'/modules/[myModuleName]/data/templates/server/def_module.js':{
	   data:'',
	   destDir:'/modules/[module]/def_[module].js',
	   userManaged:false
	},
	
	//// Convienience for using git and wanting to keep our empty directories
	//// Include .gitignore for those directories that are empty initially
	'/modules/[myModuleName]/data/templates/server/.gitignore':{
	   data:'',
	   destDir:['/modules/[module]/install/data/.gitignore',
	            '/modules/[module]/models/.gitignore',
	            '/modules/[module]/server/api/.gitignore',
	            '/modules/[module]/server/model_urls/.gitignore',
	            '/modules/[module]/server/module_api/.gitignore',
	            '/modules/[module]/titanium/.gitignore',
	            '/modules/[module]/web/pages/.gitignore',
	            '/modules/[module]/web/resources/css/.gitignore',
	            '/modules/[module]/web/resources/images/.gitignore',
	            '/modules/[module]/web/resources/scripts/.gitignore'
	            ],
	   userManaged:false
	},

};


// list of directories that need to be created for the Module
var listDestinationsDirectories = {
	'/modules/[module]':'-',
	'/modules/[module]/install': '-',
	'/modules/[module]/install/data': '-',
	'/modules/[module]/models':'-',
	'/modules/[module]/server':'-',
	'/modules/[module]/server/api':'-',
	'/modules/[module]/server/model_urls':'-',
	'/modules/[module]/server/module_api':'-',
	'/modules/[module]/titanium':'-',
	'/modules/[module]/web':'-',
	'/modules/[module]/web/pages':'-',
	'/modules/[module]/web/resources':'-',
	'/modules/[module]/web/resources/css':'-',
	'/modules/[module]/web/resources/images':'-',
	'/modules/[module]/web/resources/scripts':'-',
	//'/modules/[module]/production': '-',
};


//// LEFT OFF: verify all the .gitignore files got made.




////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.module.add' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['name']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // Make sure provided parameters are valid.
    
    var name = req.param('name');
    if (name == '') {
        logDump(req, '  - error: No name provided');

         AD.Comm.Service.sendError(req, res, {errorMSG:'name not provided.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }

    if (validation.containsPath(name)) {
        logDump(req, '  - error: Name contains disallowed characters');

         AD.Comm.Service.sendError(req, res, {errorMSG:'name contains disallowed characters.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }

    var path = __appdevPath + '/modules/' + name;
    fs.exists(path, function(isThere) {
     
        if (isThere) {
            
            // directory already exists, this is a problem!
            var msg = 'provided Module Name ['+name+'] already exists.';
            logDump(req, '  - error: ' + msg);
        
        
            AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
        
            
        } else {
            
            // not there so we can continue.
            next();
        }
    });
};



////---------------------------------------------------------------------
var initData = function (req, res, next) {
	// Gather the required Data for this operation.
	
	
	//a list of the required tags necessary in order to complete the
	// templates.  These tags should be supplied via the service call:
	var listTags = {
	    module: '?module?',
	    moduleName: '?moduleName?',
	    ModuleName: '?ModuleName?',
	};
	
	var name = req.param('name');
	
    listTags.module = name;
    listTags.moduleName = name.charAt(0).toLowerCase() + name.substr(1);
    listTags.ModuleName = name.charAt(0).toUpperCase() + name.substr(1);


    // save our values to our template tools
    req.aRAD.listTags = listTags;
    
//    templateTool.saveValues(req, listTags);

    // everything ok, so continue
    next();

}





////Define functions for passing control to our templateTool object:
var createDirectory = function (req, res, next) { 

    var listTags = req.aRAD.listTags;
    
//    templateTool.createDirectory(req, res, next); 
    var dirDone = templateTool.createDirectory(listTags);
    $.when(dirDone)
        .then(function(data){
            
            // everything ok, so continue
            next();
        })
        .fail(function(err){
            
            // return the error message
            AD.Comm.Service.sendError(req, res, {error:err}, AD.Const.HTTP.ERROR_SERVER ); // 500
        });
}



var createTemplates = function (req, res, next) { 
    
    var listTags = req.aRAD.listTags;
    
    //  templateTool.createDirectory(req, res, next); 
    var templateDone = templateTool.createTemplates(listTags);
    $.when(templateDone)
        .then(function(data){
          
          // everything ok, so continue
        next();
    })
    .fail(function(err){
      
        // return the error message
        AD.Comm.Service.sendError(req, res, {error:err}, AD.Const.HTTP.ERROR_SERVER ); // 500
    }); 
}



////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
	
	listDirectories: listDestinationsDirectories,
	listTemplates:listTemplatesModule,
});
var Validation = require('./objects/validation.js');
var validation = new Validation();



////perform these actions in sequence:
var moduleStack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,  	// make sure we have permission to access this
    verifyParams,		// make sure all required params are given
    validateParams,     // make sure params are valid
    initData,       	// prepare data (name & listTags)    
    createDirectory,	// verify all the Directories exist
    createTemplates,	// create all the expected Templates
    ];
        

appRADModule.setup = function( app ) {
	
	// make sure any messaging routines are setup.
	appRADModule.initMessaging(app);
	
	var __this = this;
	
	////---------------------------------------------------------------------
	app.post('/'+this.module.name()+'/module', moduleStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/module
	
	
	    // By the time we get here, all the processing has taken place.
		
	    logDump(req, 'finished post /'+__this.module.name()+'/module ');
	    
	    
	    // publish a notification
//	    if (appRADHub != null) appRADHub.publish('test.ping', {});
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );
	    
	    
	    
	});
	
	
	
	//// Prepare to load our templates:
	// update our paths to use our module.name()
	var data = {myModuleName:this.module.name()};
	for (var a in listTemplatesModule){
		
		////   a is our path template, so take it's value
		var entry = listTemplatesModule[a];
		
		// convert a -> a2 with our proper moduleName inserted
		var a2 = AD.Util.String.render(a, data);
		
		// add an [a2] entry
		listTemplatesModule[a2] = entry;
		
		// delete our old [a] entry
		delete listTemplatesModule[a];
	}
	
	
	//Asynchronously Load our Model templates when this service is loaded.
	for (var ti in listTemplatesModule) {
	    
	    var templatePath = __appdevPath+ti;
	    templateTool.loadTemplate(ti, templatePath, listTemplatesModule);
	}

} // end setup()


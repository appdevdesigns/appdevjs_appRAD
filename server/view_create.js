
////
//// View
////
//// Performs create for view.
////
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


var appRADViewCreate = new AD.App.Service({});
module.exports = appRADViewCreate;


////
////Setup the view template definitions:
////

////NOTE: the keys in listTemplatesModel & listDestinationsModel must match.
////  

var listTemplatesView = {
	    '/modules/[myModuleName]/data/templates/client/page_controller_view.ejs':{
	    	data:'',
	    	destDir:'/modules/[module]/web/pages/[page]/views/[view].ejs',
	    	userManaged:true
	    }
};


//// LEFT OFF: verify all the .gitignore files got made.

////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.page.add' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}


////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['view', 'module', 'page']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};


////---------------------------------------------------------------------
var initData = function (req, res, next) {
	// Gather the required data for this operation.
	
	
    // a list of the required tags necessary in order to complete the
    // templates.  These tags should be supplied via the service call:
    var listTags = {
        module:'?module?',
        page:'?page?',
        view:'?view?'
    };
    
    var ignoreFields = {};
    
    // load Template tags for this model
    for (var ti in listTags) {
    
        if (typeof ignoreFields[ti] == 'undefined') {
            
            if (typeof req.param(ti) != 'undefined') {
                listTags[ti] = req.param(ti);
            } 
            
        }
    }
    

//templateToolView.saveValues(req, listTags);
    // now create the templates:
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
var templateToolView = new TemplateTools({
    listTemplates:listTemplatesView,
});


////perform these actions in sequence:
var viewStack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,  	// make sure we have permission to access this
    verifyParams,		// make sure all required params are given
    initData,       	// prepare data (name & listTags)    
//    createTemplates,	// create all the expected Templates
    ];
        

appRADViewCreate.setup = function( app ) {
	
	var __this = this;
	
	////---------------------------------------------------------------------
	app.post('/'+this.module.name()+'/view', viewStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/module/add
	
	
	    // By the time we get here, all the processing has taken place.
		
	    logDump(req, 'finished post /'+__this.module.name()+'/view ');
	    
	    
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
    for (var a in listTemplatesView){
        
        ////   a is our path template, so take its value
        var entry = listTemplatesView[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesView[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesView[a];
    }

	
	//Asynchronously load our Model templates when this service is loaded.
	for (var ti in listTemplatesView) {
	    
	    var templatePath = __appdevPath+ti;
	    templateToolView.loadTemplate(ti, templatePath, listTemplatesView);
	}

} // end setup()


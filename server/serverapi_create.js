
////
//// Server-side API Script
////
//// Performs create for server-side API.
////
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


var appRADApiServerCreate = new AD.App.Service({});
module.exports = appRADApiServerCreate;


////
////Setup the view template definitions:
////

////NOTE: the keys in listTemplatesModel & listDestinationsModel must match.
////  

var listTemplatesApiServer = {
	    '/modules/[myModuleName]/data/templates/server/api_service_action.js':{
	    	data:'',
	    	destDir:'/modules/[module]/server/api/api_[resource]_[action].js',
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
    
    var listRequiredParams = ['module','resource','action','url']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};


////---------------------------------------------------------------------
var initData = function (req, res, next) {
	// Gather the required data for this operation.
    //a list of the required tags necessary in order to complete the
    // templates.  These tags should be supplied via the service call:
    var listTags = {
        module: '?module?',
        moduleName: '?moduleName?',
        ModuleName: '?ModuleName?',
        resource: '?resource?',
        ResourceName: '?ResourceName?',
        action: '?action?',
        ActionName: '?ActionName?',
        url: '?url?',
        requiredParams:''
    };

    var module = req.param('module') || false;
    var resource = req.param('resource') || false;
    var action = req.param('action') || false;
    var url = req.param('url') || "";
   

    listTags.module = module;
    listTags.moduleName = module.charAt(0).toLowerCase() + module.substr(1);
    listTags.ModuleName = module.charAt(0).toUpperCase() + module.substr(1);
    listTags.resource = resource.charAt(0).toLowerCase() + resource.substr(1); //resource;
    listTags.resourceName = listTags.resource;
    listTags.ResourceName = resource.charAt(0).toUpperCase() + resource.substr(1);
    listTags.action = action;
    listTags.ActionName = action.charAt(0).toUpperCase() + action.substr(1);
    
    
    var verb = 'all';
    var publicLink = '';
    var requiredParams = '';  // NOTE: Not implemented yet...
    
    if (action === 'create'){
        verb = 'post';
        publicLink = "    create:  { method:'POST',   uri:'/"+listTags.moduleName+"/"+listTags.resource+"', params:{"+requiredParams+"}, type:'action' },";
    }else if (action === 'findAll'){
        verb = 'get';
        publicLink = "    findAll: { method:'GET',    uri:'/"+listTags.moduleName+"/"+listTags.resource+"', params:{"+requiredParams+"}, type:'resource' },";
    }else if (action === 'findOne'){
        verb = 'get';
        publicLink = "    findOne: { method:'GET',    uri:'/"+listTags.moduleName+"/"+listTags.resource+"/[id]', params:{"+requiredParams+"}, type:'resource' },";
    }else if (action === 'update'){
        verb = 'post';
        publicLink = "    update:  { method:'PUT',    uri:'/"+listTags.moduleName+"/"+listTags.resource+"/[id]', params:{"+requiredParams+"}, type:'action' },";
    }else if (action === 'destroy'){
        verb = 'delete';
        publicLink = "    destroy: { method:'DELETE', uri:'/"+listTags.moduleName+"/"+listTags.resource+"/[id]', params:{"+requiredParams+"}, type:'action' },";
    }else {
        var uri = "/"+listTags.moduleName+"/"+listTags.resourceName+"/"+action;
        if (url != '') uri = url;
        verb = 'get';
        publicLink = "    "+action+": { method:'GET', uri:'"+uri+"', params:{"+requiredParams+"}, type:'action' },";
    
    }
    
    listTags.url = url;
    listTags.verb = verb;
    listTags.publicLink = publicLink;


    // Create the templates: 
    var templateDone = templateToolApiServer.createTemplates(listTags);
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
var templateToolApiServer = new TemplateTools({
    listTemplates:listTemplatesApiServer,
});




////perform these actions in sequence:
var apiserverStack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,  		   // make sure we have permission to access this
    verifyParams,			   // make sure all required params are given
    initData,       		   // prepare data (name & listTags)    
    ];
        

appRADApiServerCreate.setup = function( app ) {
	
	var __this = this;
	
	////---------------------------------------------------------------------
	app.post('/'+this.module.name()+'/serverapi', apiserverStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/module/add
	
	
	    // By the time we get here, all the processing has taken place.
		
	    logDump(req, 'finished post /'+__this.module.name()+'/serverapi ');
	    
	    
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
    for (var a in listTemplatesApiServer){
        
        ////   a is our path template, so take its value
        var entry = listTemplatesApiServer[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesApiServer[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesApiServer[a];
    }

	
	//Asynchronously load our Model templates when this service is loaded.
	for (var ti in listTemplatesApiServer) {
	    
	    var templatePath = __appdevPath+ti;
	    templateToolApiServer.loadTemplate(ti, templatePath, listTemplatesApiServer);
	}

} // end setup()


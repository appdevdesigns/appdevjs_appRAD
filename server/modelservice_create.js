
////
//// Model Service Create
////
//// This service is created to handle requests to generate new Model 
//// definitions for a Module.
////
////    /appRad/modelservice/create   : tableName=X, module=Y, ModelName=Z, primaryKey=K, labelKey=L
////        Creates a new model from DB table X  under application Module Y
////
////

var $ = AD.jQuery;
var log = AD.Util.Log;
var logDump = AD.Util.LogDump;


var appRADServiceModelCreate = new AD.App.Service({});
module.exports = appRADServiceModelCreate;


////
//// Setup the Model Template Definitions:
////
     

var listTemplatesModel = {
    '/modules/[myModuleName]/data/templates/server/modelService.js':{
        data:'',
        destDir:'/modules/[module]/models/[ResourceName].js',
        userManaged:false
    }
};

var listTemplatesService = {
	    '/modules/[myModuleName]/data/templates/server/service_action.js':{
	        data:'',
	        destDir:'/modules/[module]/server/[resourceName]_[action].js',
	        userManaged:false
	    }
	};


////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.Developer' action
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}

////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['module', 'resourceName', 'primaryKey', 'labelKey', 'publicLinks']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};

////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // Make sure provided parameters are valid.
    
	var moduleName = req.param('module');
    var name = req.param('resourceName');
    if (name == '') {
        logDump(req, '  - error: No name provided');

        AD.Comm.Service.sendError(req, res, {errorMSG:'name not provided.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }
    if (moduleName == '') {
        logDump(req, '  - error: No module name provided');

        AD.Comm.Service.sendError(req, res, {errorMSG:'module name not provided.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }

    if (validation.containsPath(name)) {
        logDump(req, '  - error: Name contains disallowed characters');

        AD.Comm.Service.sendError(req, res, {errorMSG:'name contains disallowed characters.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }
    if (validation.containsPath(moduleName)) {
        logDump(req, '  - error: module name contains disallowed characters');

        AD.Comm.Service.sendError(req, res, {errorMSG:'module name contains disallowed characters.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }

    var path = __appdevPath + '/modules/' + moduleName;
    fs.exists(path, function(isThere) {
     
        if ((!isThere)) {
            
            // directory doesn't exist, this is a problem!
            var msg = 'provided Module Name ['+moduleName+'] does not exist.';
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
	
    // a list of the required tags necessary in order to complete the
    // templates.  These tags should be supplied via the service call:
    var listTags = {
        module:'?module?',
        moduleName:'?moduleName?',
        resourceName:'?resourceName?',
        ResourceName:'?ResourceName?',
        primaryKey:'?primaryKey?',
        labelKey:'?labelKey?',
    };
    
    var module = req.param('module');
    var resourceName = req.param('resourceName');
    var primaryKey = req.param('primaryKey');
    var labelKey = req.param('labelKey');
    listTags.module = module;
    listTags.moduleName = module;
    listTags.resourceName = resourceName.charAt(0).toLowerCase() + resourceName.substr(1);
    listTags.ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.substr(1);
    listTags.primaryKey = primaryKey;
    listTags.labelKey = labelKey;  
    
    var publicLinks = req.param('publicLinks');
    
    //console.log(listTags);
    req.aRAD.listTags = listTags;
    
    next();
};


//these are our publicly available /site/api/[moduleName]/module  links;
var publicLinks = {
   create:  { method:'POST',  uri:'/[moduleName]/modelservice', params:{module:'[module]', resourceName:'[resourceName]', primaryKey:'[primaryKey]', labelKey:'[labelKey]', publicLinks:'[publicLinks]'}, type:'action' }
}

// be sure to run through these filters before accessing our Create
// Model service:

//// Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateToolModel = new TemplateTools({
    listTemplates:listTemplatesModel
});

var templateToolService = new TemplateTools({
    listTemplates:listTemplatesService
});



var createModelTemplates = function (req, res, next) { 
//	templateToolModel.createTemplates(req, res, next);
    
	var listTags = req.aRAD.listTags;
	
    // now create the templates:
    var templateDone = templateToolModel.createTemplates(listTags);
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



var createServiceTemplates = function (req, res, next) { 
	
    var publicLinks = req.param('publicLinks');
    
    //console.log(listTags);
    var opsDone = 0;
    
    for (var i=0;i<publicLinks.length;i++){
    	// a list of the required tags necessary in order to complete the
        // templates.  These tags should be supplied via the service call:
/*        var listTags = {
            module:'?module?',
            moduleName:'?moduleName?',
            resourceName:'?resourceName?',
            ResourceName:'?ResourceName?',
            primaryKey:'?primaryKey?',
            labelKey:'?labelKey?',
            action:'?action?',
            ActionName:'?ActionName?',
            requiredParams:''               // requiredParams are not implementd yet...
        };
        
        var module = req.param('module');
        var resourceName = req.param('resourceName');
        var primaryKey = req.param('primaryKey');
        var labelKey = req.param('labelKey');
*/
        var listTags = {
                action:'?action?',
                ActionName:'?ActionName?',
                requiredParams:'',               // requiredParams are not implementd yet... (be sure to populate the params:{} in links below)
                publicLink:''                    // which link is this service exposing?
        }
        
        for (var t in req.aRAD.listTags) {
            listTags[t] = req.aRAD.listTags[t];
        }
            
        var action = publicLinks[i];
        var verb = 'all';
        var publicLink = '';
        
        if (action === 'create'){
        	verb = 'post';
        	publicLink = "        create:  { method:'"+verb.toUpperCase()+"',   uri:'/[moduleName]/[resourceName]', params:{}, type:'action' },";
        }else if (action === 'findAll'){
        	verb = 'get';
        	publicLink = "        findAll: { method:'"+verb.toUpperCase()+"',    uri:'/[moduleName]/[resourceName]s', params:{}, type:'resource' },";
        }else if (action === 'findOne'){
        	verb = 'get';
        	publicLink = "        findOne: { method:'"+verb.toUpperCase()+"',    uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'resource' },";
        }else if (action === 'update'){
        	verb = 'put';
        	publicLink = "        update:  { method:'"+verb.toUpperCase()+"',    uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'action' },";
        }else if (action === 'destroy'){
        	verb = 'delete';
        	publicLink = "        destroy: { method:'"+verb.toUpperCase()+"', uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'action' },";
        }
         
        listTags.action = action;
        listTags.ActionName = action.charAt(0).toUpperCase() + action.substr(1);
        listTags.verb = verb;
        listTags.publicLink = publicLink;
        
//    	templateToolService.saveValues(req, listTags);
//    	templateToolService.createTemplates(req, res, next); 

            
        // now create the current template:
        var done = templateToolService.createTemplates(listTags);
        
        var checkDone = function( dfdDone ) {
            $.when(dfdDone)
            .then(function(data){
                
                opsDone++;
                if (opsDone >= publicLinks.length) {
                    
                    // now all our services have completed so continue
                    next();
                }
            })
            .fail(function(err){
                
                // return the error message
                AD.Comm.Service.sendError(req, res, {error:err}, AD.Const.HTTP.ERROR_SERVER ); // 500
            });
        } // end checkDone
        checkDone(done);
        
    }
    
}


var Validation = require('./objects/validation.js');
var validation = new Validation();

var modelServiceStack = [
        AD.App.Page.serviceStack,
        hasPermission,  // make sure we have permission to access this
        verifyParams,   // make sure our required Params are given
        validateParams, // make sure given params are valid 
        initData,       // prepare data (name & listTags)    
        createModelTemplates, // create all the expected Templates
        createServiceTemplates
        ];
        

appRADServiceModelCreate.setup = function(app) {

    ////---------------------------------------------------------------------
    app.post('/'+this.module.name()+'/modelservice', modelServiceStack, function(req, res, next) {
        //// Creates a new model from DB table X  under application Module Y
        // test using: http://localhost:8085/appRad/model?module=test&ModelName=Settings&tableName=site_settings&primaryKey=settings_id&labelKey=settings_label
    
        
        // By the time we get here, all the processing has taken place.
    
        AD.Util.LogDump(req, 'finished');
        
        
        // send a success message
        AD.Comm.Service.sendSuccess(req, res, {message:'all model templates written.' } );
    });

    
    //// Prepare to load our templates:
    // update our paths to use our module.name()
    var data = {myModuleName:this.module.name()};
    for (var a in listTemplatesModel){
        
        ////   a is our path template, so take it's value
        var entry = listTemplatesModel[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesModel[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesModel[a];
    }
    
    for (var a in listTemplatesService){
        
        ////   a is our path template, so take it's value
        var entry = listTemplatesService[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesService[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesService[a];
    }
    
    
    // Asynchronously Load our Model templates 
    for (var ti in listTemplatesModel) {

        var path = __appdevPath+ti;
        templateToolModel.loadTemplate(ti, path, listTemplatesModel);
        
    }
    
    
    // Asynchronously Load our Service templates 
    for (var ti in listTemplatesService) {

        var path = __appdevPath+ti;
        templateToolService.loadTemplate(ti, path, listTemplatesService);
        
    }

	this.setupSiteAPI('modelservice', publicLinks);
    
}
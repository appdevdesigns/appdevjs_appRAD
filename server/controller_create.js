
////
//// Controller
////
//// Performs the actions for controller.
////
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


var appRADController = new AD.App.Service({});
module.exports = appRADController;


////
////Setup the controller template definitions:
////

var listTemplatesController = {
    '/modules/[myModuleName]/data/templates/client/page_controller.js':{
        data:'',
        destDir:'/modules/[module]/web/pages/[page]/scripts/[controller].js',
        userManaged:true
    },
    '/modules/[myModuleName]/data/templates/client/page_controller_view.ejs':{
        data:'',
        destDir:'/modules/[module]/web/pages/[page]/views/[controller].ejs',
        userManaged:true
    },
    
};



////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.controller.add' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['module', 'page', 'controller'];
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    var moduleName = req.param('module');
    var pageName = req.param('page');
    var controllerName = req.param('controller');
    if (controllerName == '') {
        logDump(req, '  - error: No controller name provided');

        AD.Comm.Service.sendError(req, res, {errorMSG:'controller name not provided.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }
    if (moduleName == '') {
        logDump(req, '  - error: No module name provided');

        AD.Comm.Service.sendError(req, res, {errorMSG:'module name not provided.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }
    if (pageName == '') {
        logDump(req, '  - error: No page name provided');

        AD.Comm.Service.sendError(req, res, {errorMSG:'page name not provided.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }

    if (validation.containsPath(controllerName)) {
        logDump(req, '  - error: controller name contains disallowed characters');

        AD.Comm.Service.sendError(req, res, {errorMSG:'controller name contains disallowed characters.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }
    if (validation.containsPath(moduleName)) {
        logDump(req, '  - error: module name contains disallowed characters');

        AD.Comm.Service.sendError(req, res, {errorMSG:'module name contains disallowed characters.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

        return;
    }
    if (validation.containsPath(pageName)) {
        logDump(req, '  - error: page name contains disallowed characters');

        AD.Comm.Service.sendError(req, res, {errorMSG:'page name contains disallowed characters.'}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

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
            path = path+'/web/pages/'+pageName + '/scripts/' + controllerName + '.js';
            fs.exists(path, function(isThere) {

                if (isThere) {

                    // directory already exists, this is a problem!
                    var msg = 'provided controller script ['+controllerName+'] already exists.';
                    logDump(req, '  - error: ' + msg);

                    AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault


                } else {
                	path = path+'/views/'+controllerName + '.ejs';
                	fs.exists(path, function(isThere) {

                		if (isThere) {

                			// directory already exists, this is a problem!
                			var msg = 'provided controller view ['+name+'] already exists.';
                			logDump(req, '  - error: ' + msg);

                			AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault


                		} else {

                			// not there so we can continue.
                			next();
                		}
                	});
                }
            });
        }
    });

    
};



////---------------------------------------------------------------------
var initData = function (req, res, next) {
    // Gather the required data for this operation.


    //a list of the required tags necessary in order to complete the
    // templates.  These tags should be supplied via the service call:
    var listTags = {
        module: '?module?',
        page: '?page?',
        controller: '?controller?',
    };

    var module = req.param('module') || false;
    var page = req.param('page') || false;
    var controller = req.param('controller') || false;

    listTags.module = module;
    listTags.page = page;
    listTags.controller = controller;


    // save our values to our template tools
//templateTool.saveValues(req, listTags);

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





////Define functions for passing control to our templateTool object:
var createTemplates = function (req, res, next) { 
    templateTool.createTemplates(req, res, next); 
    }



////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({

    listTemplates:listTemplatesController,
});

var Validation = require('./objects/validation.js');
var validation = new Validation();



////perform these actions in sequence:
var controllerStack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,      // make sure we have permission to access this
    verifyParams,       // make sure all required params are given
    validateParams,     // make sure params are valid
    initData,           // prepare data (name & listTags)    
//    createTemplates,    // create all the expected Templates
    ];
        

appRADController.setup = function( app ) {

    var __this = this;

    ////---------------------------------------------------------------------
    app.post('/'+this.module.name()+'/controller', controllerStack, function(req, res, next) {
        // test using: http://localhost:8088/appRAD/controller


        // By the time we get here, all the processing has taken place.
        
        logDump(req, 'finished post /'+__this.module.name()+'/controller ');
        
        
        // publish a notification
    //    if (appRADHub != null) appRADHub.publish('test.ping', {});
        
        // send a success message
        var successStub = {
                message:'done.' 
        }
        AD.Comm.Service.sendSuccess(req, res, successStub );
        
        
        
    });



    //// Prepare to load our templates:
    // update our paths to use our module.name()
    var data = {myModuleName:this.module.name()};
    for (var a in listTemplatesController){
        
        ////   a is our path template, so take its value
        var entry = listTemplatesController[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesController[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesController[a];
    }


    //Asynchronously load our controller templates when this service is loaded.
    for (var ti in listTemplatesController) {
        
        var templatePath = __appdevPath+ti;
        templateTool.loadTemplate(ti, templatePath, listTemplatesController);
    }

} // end setup()


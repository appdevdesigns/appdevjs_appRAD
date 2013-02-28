
////
//// Page
////
//// Performs the actions for page.
////
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


var appRADPage = new AD.App.Service({});
module.exports = appRADPage;


////
////Setup the page template definitions:
////

////NOTE: the keys in listTemplatesModel & listDestinationsModel must match.
////  

var listTemplatesPage = {
    '/modules/[myModuleName]/data/templates/server/.gitignore':{
        data:'',
        destDir:['/modules/[module]/web/pages/[page]/css/.gitignore',
                 '/modules/[module]/web/pages/[page]/containers/.gitignore',
                 '/modules/[module]/web/pages/[page]/images/.gitignore',
                 '/modules/[module]/web/pages/[page]/production/.gitignore',
                ],
        userManaged:false
    },
    '/modules/[myModuleName]/data/templates/server/node_page.js':{
        data:'',
        destDir:'/modules/[module]/web/pages/[page]/node_[page].js',
        userManaged:true
    },
    
    '/modules/[myModuleName]/data/templates/client/page.js':{
        data:'',
        destDir:'/modules/[module]/web/pages/[page]/scripts/[page].js',
        userManaged:true
    },
    
    '/modules/[myModuleName]/data/templates/client/pageRAD.js':{
        data:'',
        destDir:'/modules/[module]/web/pages/[page]/scripts/[page]RAD.js',
        userManaged:true
    },
    
    
    '/modules/[myModuleName]/data/templates/server/page.ejs':{
        data:'',
        destDir:'/modules/[module]/web/pages/[page]/views/[page].ejs',
        userManaged:true
    },
};


// list of directories that need to be created for the Module
var listDestinationsDirectories = {
    '/modules/[module]/web/pages/[page]':'-',
    '/modules/[module]/web/pages/[page]/containers':'-',
    '/modules/[module]/web/pages/[page]/css':'-',
    '/modules/[module]/web/pages/[page]/images':'-',
    '/modules/[module]/web/pages/[page]/scripts':'-',
    '/modules/[module]/web/pages/[page]/production':'-',
    '/modules/[module]/web/pages/[page]/views':'-',
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

};



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['page', 'module']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    var moduleName = req.param('module');
    var name = req.param('page');
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
            path = path+'/web/pages/'+name;
            fs.exists(path, function(isThere) {

                if (isThere) {

                    // directory already exists, this is a problem!
                    var msg = 'provided page name ['+name+'] already exists.';
                    logDump(req, '  - error: ' + msg);

                    AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault


                } else {

                    // not there so we can continue.
                    next();
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
        moduleName: '?moduleName?',
        ModuleName: '?ModuleName?',
        page: '?page?',
        pageName: '?pageName?',
        PageName: '?PageName?',
    };

    var name = req.param('page') || false;
    var module = req.param('module') || false;

    listTags.module = module;
    listTags.moduleName = module.charAt(0).toLowerCase() + module.substr(1);
    listTags.ModuleName = module.charAt(0).toUpperCase() + module.substr(1);
    listTags.page = name;
    listTags.pageName = name.charAt(0).toLowerCase() + name.substr(1);
    listTags.PageName = name.charAt(0).toUpperCase() + name.substr(1);


    // save our values to our template tools
    req.aRAD.listTags = listTags;

    // everything ok, so continue
    next();

};



////---------------------------------------------------------------------
var createDirectory = function (req, res, next) { 
    // verify all the Directories exist
    
    var listTags = req.aRAD.listTags;
    
    //  templateTool.createDirectory(req, res, next); 
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
  
};
    
    
    
////---------------------------------------------------------------------
var createTemplates = function (req, res, next) { 
    // create all the expected Templates
    
    var listTags = req.aRAD.listTags;
     
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
};



////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({

    listDirectories: listDestinationsDirectories,
    listTemplates:listTemplatesPage,
});
var Validation = require('./objects/validation.js');
var validation = new Validation();



////perform these actions in sequence:
var moduleStack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,      // make sure we have permission to access this
    verifyParams,        // make sure all required params are given
    validateParams,     // make sure params are valid
    initData,           // prepare data (name & listTags)
    createDirectory,    // verify all the Directories exist
    createTemplates,    // create all the expected Templates
    ];
        

appRADPage.setup = function( app ) {

    var __this = this;

    ////---------------------------------------------------------------------
    app.post('/'+this.module.name()+'/page', moduleStack, function(req, res, next) {


        // By the time we get here, all the processing has taken place.

        logDump(req, 'finished post /'+__this.module.name()+'/page ');


        // publish a notification
//        if (appRADHub != null) appRADHub.publish('test.ping', {});

        // send a success message
        var successStub = {
                message:'done.'
        };
        AD.Comm.Service.sendSuccess(req, res, successStub );



    });



    //// Prepare to load our templates:
    // update our paths to use our module.name()
    var data = {myModuleName:this.module.name()};
    for (var a in listTemplatesPage){

        ////   a is our path template, so take its value
        var entry = listTemplatesPage[a];

        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);

        // add an [a2] entry
        listTemplatesPage[a2] = entry;

        // delete our old [a] entry
        delete listTemplatesPage[a];
    }


    //Asynchronously load our Model templates when this service is loaded.
    for (var ti in listTemplatesPage) {

        var templatePath = __appdevPath+ti;
        templateTool.loadTemplate(ti, templatePath, listTemplatesPage);
    }

} // end setup()


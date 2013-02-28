
////
//// Controller List
////
//// Performs the actions for controller.
////
////    /appRAD/controllers 
////
////

var fs = require('fs');

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;



var appRADControllerList = new AD.App.Service({});
module.exports = appRADControllerList;





////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.controller.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['module', 'page']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
// Make sure provided parameters are valid.

var module = req.param('module');
var page = req.param('page');
var path = __appdevPath + '/modules/' + module;
fs.exists(path, function(isThere) {
 
    if ((!isThere) || (module == '')) {
        
        // directory doesn't exist, this is a problem!
        var msg = 'provided Module Name ['+module+'] does not exist.';
        logDump(req, '  - error: ' + msg);

        AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault

    } else {
        path = path + '/web/pages/' + page;
        fs.exists(path, function(isThere) {
            if ((!isThere) || (page == '')) {
                var msg = 'provided Page Name ['+page+'] does not exist.';
                logDump(req, '  - error: ' + msg);
                AD.Comm.Service.sendError(req, res, {errorMSG:msg}, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
            } else {
               // it's there so we can continue.
                next();
            }
        });
    }
});
};



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // get a list of all the files under .../moduleName/web/pages/[pageName]/scripts
    // except for the [pageName]RAD.js file.
    var moduleName = req.param('module');
    var pageName = req.param('page');
    var path = __appdevPath+'/modules/'+moduleName+'/web/pages/'+pageName+'/scripts';
    templateTool.listFileNames(path, function(err, list) {
        if (err) {
            // return error message to browser
            AD.Comm.Service.sendError(req, res, {
                success: 'false',
                errorID:'150',
                errorMSG:'Error reading path['+path+']: '+err,
                data:{}
            }, AD.Const.HTTP.ERROR_NOTFOUND);
        } else{ 
            // Remove reserved files from the list
            for (var i = 0; i < list.length; ) {
                var fileName = list[i].name;
                if (fileName == pageName+'RAD.js') {
                    list.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            
            // package the file info into an array of filenames
            req.aRad = {};
            req.aRad.listFiles = list;
            next();
        }
    });

}

//these are our publicly available /site/api/[moduleName]/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/[moduleName]/controllers', params:{module:'[module]', page: '[page]'}, type:'resource' },
        findOne: { method:'GET',  uri:'/[moduleName]/controller/[id]', params:{module:'[module]', page: '[page]'}, type:'resource' },
        create:  { method:'POST',  uri:'/[moduleName]/controller', params:{module:'[module]', page: '[page]', controller: '[controller]'}, type:'action' },
        update:  { method:'POST', uri:'/[moduleName]/controller/[id]', params:{module:'[module]', page: '[page]'}, type:'action' } 
}


////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
});


var viewStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,       // make sure our required Params are given
        validateParams,     // make sure given params are valid
        gatherList          // get a list of all files
    ];
        


appRADControllerList.setup = function(app) {

    
    ////---------------------------------------------------------------------
    app.all('/'+this.module.name()+'/controllers', viewStack, function(req, res, next) {
        // test using: http://localhost:8088/appRAD/controllers


        // By the time we get here, all the processing has taken place.

        logDump(req, 'finished controllers ...');

        
        // send a success message
        AD.Comm.Service.sendSuccess(req, res, req.aRad.listFiles );
        
    });


    // update our urls to use our module.name()
    var data = {moduleName:this.module.name()};
    for (var a in publicLinks){
        var entry = publicLinks[a];
        publicLinks[a].uri = AD.Util.String.render(entry.uri, data); //entry.uri.replace('[moduleName]', this.module.name());
    }


    ////Register the public site/api
    var definition = { 
        module:this.module.name(),
        resource:'controller'
    }
    AD.Util.Service.registerAPI(definition, publicLinks);

}
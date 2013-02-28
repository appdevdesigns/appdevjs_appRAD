/**
 * @class [moduleName]
 * @parent Installed_Modules
 * 
 * ###[moduleName] Module
 * 
 * This module <insert short description>
 * 
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].server
 * @parent [moduleName]
 * 
 * ##[moduleName] server
 * 
 * [moduleName] server side 
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].server.api
 * @parent [moduleName].server
 * 
 * ##[moduleName] server side apis
 * 
 * [moduleName] server side apis
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].server.models
 * @parent [moduleName].server
 * 
 * ##[moduleName] server side models
 * 
 * [moduleName] server side models
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].server.module_apis
 * @parent [moduleName].server
 * 
 * ##[moduleName] server side module apis
 * 
 * [moduleName] server side module apis
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].client
 * @parent [moduleName]
 * 
 * ##[moduleName] client
 * 
 * [moduleName] client side
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].client.pages
 * @parent [moduleName].client
 * 
 * ##[moduleName] client side pages
 * 
 * [moduleName] client side pages
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class [moduleName].titanium
 * @parent [moduleName]
 * 
 * ##[moduleName] titanium
 * 
 * [moduleName] titanium
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;
 



var log = AD.Util.Log;
var $ = AD.jQuery;


////
//// [ModuleName] Module
////

var [moduleName]Module = new AD.App.Module({
    nameModule: '[moduleName]',
    pathModule: __dirname,
/*
    // change the default paths like this:
    pathPages:    __dirname + '/web/pages',
    pathServerModels:  __dirname + '/models/node',
    pathClientModels:  __dirname + '/models/client',
    pathModuleScripts: __dirname + '/data/scripts',
    pathModuleCSS:     __dirname + '/data/css'
*/
/*
    // If you want to override the default notification hub settings:
    hub: {
          wildcard: true, // should the event emitter use wildcards.
          delimiter: '.', // the delimiter used to segment namespaces.
          maxListeners: 0, // the max number of listeners that can be assigned to an event (defautl:10;  0:unlimited).
    }
*/
    
    });
    
[moduleName]Module.createRoutes();
var mI = [moduleName]Module.initialize();  // mI == Module Initialization Done
$.when(mI).then(function(){
    // do any post initialization setup instructions here.
    // by the time you get here, all module resources are loaded.
});


module.exports = [moduleName]Module;
exports.version = 1;  // v1 of our AD.App.Module Definition


var app = [moduleName]Module.app;


/*
////
//// setup any [ModuleName] specific routes here
////

### If you want to override the default Route Handling then
### remove [moduleName]Module.createRoutes(); and uncomment this section.  
### Make your changes here:

////
//// On any /[moduleName]/* route, we make sure our Client Models are loaded:
//// 
app.get('/init/[moduleName]/*', function(req, res, next) {

        log(req,' init/' + [moduleName]Module.nameModule + '/*  : adding model dependencies.');

        AD.App.Page.addJavascripts( req, [moduleName]Module.moduleScripts );
        AD.App.Page.addJavascripts( req, [moduleName]Module.listModelPaths );

        next();
});





////
//// Return any Module defined resources
////
app.get('/[moduleName]/data/:resourcePath', function(req, res, next) {

    log(req,' /' + [moduleName]Module.nameModule + '/data/ being processed.');

    var parts = req.url.split('/'+[moduleName]Module.nameModule+'/');
    var urlParts = parts[1].split('?');
    var path = urlParts[0]; // without any additional params

    res.sendfile( [moduleName]Module.pathModule+'/'+path);
});







### If you want to change/prevent any of the automatic directory 
### scanning, then remove the [moduleName]Module.initialize()  and 
### uncomment these lines :




//// 
//// Scan any sub interfaces to gather their routes
////

[moduleName]Module.loadInterfaces();



////
//// The Model objects 
////
//// Load the Server side model objects to handle incoming model actions.
////

[moduleName]Module.loadModels();
exports.listModels=[moduleName]Module.listModels;


////
//// 
//// Load the shared scripts that need to be used on each interface.

[moduleName]Module.loadModuleScripts();



//// Load the services associated with this Module.
[moduleName]Module.loadServices();



//// Load any shared CSS files defined by this Module.
[moduleName]Module.loadModuleCSS();

*/
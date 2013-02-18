/**
 * @class appRAD
 * @parent Installed_Modules
 * 
 * ###AppRAD Module
 * 
 * This module can be used to quickly create new appDev modules, models and interfaces. 
 * 
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class appRAD.server
 * @parent appRAD
 * 
 * ##appRAD server
 * 
 * appRAD server
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class appRAD.client
 * @parent appRAD
 * 
 * ##appRAD client
 * 
 * appRAD client
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;

/**
 * @class appRAD.titanium
 * @parent appRAD
 * 
 * ##appRAD titanium
 * 
 * appRAD titanium
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;



//Replace These Tags:
//appRAD  : <-- the name of this module (lowercase)
//AppRAD  : <-- the name of this module (uppercase)

var log = AD.Util.Log;
var $ = AD.jQuery;


var appRADModule = new AD.App.Module({
    nameModule: 'appRAD',
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
    
appRADModule.createRoutes();
var mI = appRADModule.initialize();  // mI == Module Initialization Done
$.when(mI).then(function(){
    // do any post initialization setup instructions here.
    // by the time you get here, all module resources are loaded.
});


module.exports = appRADModule;
exports.version = 1;  // v1 of our AD.App.Module Definition


var app = appRADModule.app;


/*
////
//// setup any AppRAD specific routes here
////

### If you want to override the default Route Handling then
### remove appRADModule.createRoutes(); and uncomment this section.  
### Make your changes here:

////
//// On any /appRAD/* route, we make sure our Client Models are loaded:
//// 
app.get('/init/appRAD/*', function(req, res, next) {

        log(req,' init/' + appRADModule.nameModule + '/*  : adding model dependencies.');

        AD.App.Page.addJavascripts( req, appRADModule.moduleScripts );
        AD.App.Page.addJavascripts( req, appRADModule.listModelPaths );

        next();
});





////
//// Return any Module defined resources
////
app.get('/appRAD/data/:resourcePath', function(req, res, next) {

    log(req,' /' + appRADModule.nameModule + '/data/ being processed.');

    var parts = req.url.split('/'+appRADModule.nameModule+'/');
    var urlParts = parts[1].split('?');
    var path = urlParts[0]; // without any additional params

    res.sendfile( appRADModule.pathModule+'/'+path);
});







### If you want to change/prevent any of the automatic directory 
### scanning, then remove the appRADModule.initialize()  and 
### uncomment these lines :




//// 
//// Scan any sub interfaces to gather their routes
////

appRADModule.loadInterfaces();



////
//// The Model objects 
////
//// Load the Server side model objects to handle incoming model actions.
////

appRADModule.loadModels();
exports.listModels=appRADModule.listModels;


////
//// 
//// Load the shared scripts that need to be used on each interface.

appRADModule.loadModuleScripts();



//// Load the services associated with this Module.
appRADModule.loadServices();



//// Load any shared CSS files defined by this Module.
appRADModule.loadModuleCSS();

*/
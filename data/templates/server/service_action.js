//// Template Replace:
//   [moduleName]     : the name of this interface's module: (lowercase)
//   [resourceName]       : the name of this service :  (lowercase)
//   [ResourceName]   : the name of this service :  (Uppercase)
//   [ActionName]	  : the action for this service : (lowercase) (optional).
//   [requiredParams] : a list of required parameters for this service ('param1', 'param2', 'param3')

/**
 * @class [moduleName].server.module_apis.[resourceName]
 * @parent [moduleName].server.module_apis
 * 
 * Performs the actions for [resource].
 * @apprad resource:[resource] // @appradend (please leave)
 * @apprad action:[action] // @appradend (please leave)
 * @apprad url:[url] // @appradend
 */


////
//// [moduleName][ResourceName]
////
//// Performs the actions for [resource].
////
////    /[resource] 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


////Create our Validation object
//var Validation = require(__appdevPath+'/server/objects/validation.js');
//var validation = new Validation();


var [moduleName][ResourceName][ActionName] = new AD.App.Service({});
module.exports = [moduleName][ResourceName][ActionName];






////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has '[moduleName].[resourceName].[action]' action/permission
    next();
    // else
        // var errorData = { errorID:55, errorMSG:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = [[requiredParams]]; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



// these are our publicly available /site/api/[moduleName]/[resourceName]  links:
// note: in below definitions, any value in [] is a templated value replaced with the instances value for that attribute: [id] = obj.id;
// note: params are defined like:  params:{ requiredParam1:'[requiredParam1]', requiredParam2: '[requiredParam2]'}
var publicLinks = {
//        findAll: { method:'GET',    uri:'/[moduleName]/[resourceName]s', params:{}, type:'resource' },
//        findOne: { method:'GET',    uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'resource' },
//        create:  { method:'POST',   uri:'/[moduleName]/[resourceName]', params:{}, type:'action' },
//        update:  { method:'PUT',    uri:'/[moduleName]/[resourceName]/[id]', params:{module:'[module]', page: '[page]'}, type:'action' },
//        destroy: { method:'DELETE', uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'action' },
[publicLink] 
}

var serviceURL = publicLinks.[action].uri.replace('[id]',':id');

var [resourceName]Stack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,		       // make sure we have permission to access this
    verifyParams,			   // make sure all required params are given
//  step2,   	               // get a list of all Viewers
//  step3		               // update each viewer's entry
    ];
        

[moduleName][ResourceName][ActionName].setup = function( app ) {

	
	////---------------------------------------------------------------------
	app.[verb](serviceURL, [resourceName]Stack, function(req, res, next) {
	    // test using: http://localhost:8088/[moduleName]/[resourceName]
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /[module]/[resourceName] ([action])');
	    
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );  
	    
	});
	

    ////Register the public site/api
    this.setupSiteAPI('[resourceName]', publicLinks);
} // end setup()


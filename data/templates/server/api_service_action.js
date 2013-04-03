
/**
 * @class [moduleName].server.api.[ResourceName]
 * @parent [moduleName].server.api
 *
 * Performs the action ([action]) for [resource].
 * @apprad resource:[resource] // @appradend (please leave)
 * @apprad action:[action] // @appradend (please leave)
 * @apprad url:[url] // @appradend
 */


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var error = AD.Util.Error;
var errorDump = AD.Util.ErrorDump;
var $ = AD.jQuery;

var ErrorMSG = null;

var [moduleName][ResourceName][ActionName] = new AD.App.Service({});
module.exports = [moduleName][ResourceName][ActionName];






////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.



    var permission = '[moduleName].[resourceName].[action]';
    var viewer = AD.Viewer.currentViewer(req);

    log(req, '   - hasPermission(): checking for : '+permission);

    // if viewer has 'hris.person.findAll' action/permission
    if (viewer.hasTask(permission)) {

        log(req, '     viewer has permission: '+permission);
        next();

    } else {

        errorDump(req, '     viewer failed permission check!');
        ErrorMSG(req, res, 'ERR_NO_PERMISSION', AD.Const.HTTP.ERROR_FORBIDDEN);  // 403 : you don't have permission

    } // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.

    log(req, '   - verifyParams(): checking parameters');

    var listRequiredParams = {
//          'test':['exists','notEmpty','isNumeric'],
//          'test2':['notEmpty']
    }; // each param is a string
    AD.Util.Service.validateParamsExpress(req, res, next, listRequiredParams);
};




//these are our publicly available /site/api/[moduleName]/[resource]  links:
//note: in below definitions, any value in [] is a templated value replaced with the instances value for that attribute: [id] = obj.id;
//note: params are defined like:  params:{ requiredParam1:'[requiredParam1]', requiredParam2: '[requiredParam2]'}
var publicLinks = {
//     findAll: { method:'GET',    uri:'/[moduleName]/[resourceName]s',     params:{}, type:'resource' },
//     findOne: { method:'GET',    uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'resource' },
//     create:  { method:'POST',   uri:'/[moduleName]/[resourceName]',      params:{}, type:'action' },
//     update:  { method:'PUT',    uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'action' },
//     destroy: { method:'DELETE', uri:'/[moduleName]/[resourceName]/[id]', params:{}, type:'action' },
[publicLink]
}

var serviceURL = publicLinks.[action].uri.replace('[id]',':id');


var [resource]Stack = [
    AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,		       // make sure we have permission to access this
    verifyParams,			   // make sure all required params are given

//   step2, 	               // get a list of all Viewers
//   step3		               // update each viewer's entry
    ];


[module][ResourceName][ActionName].setup = function( app ) {

    ErrorMSG = this.module.Error;

	////---------------------------------------------------------------------
	app.[verb](serviceURL, [resource]Stack, function(req, res, next) {
	    // test using: http://localhost:8088/[moduleName]/[serviceName]/[actionName]


	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /'+serviceURL+' ([action]) ');


	    // send a success message
	    var successStub = {
	            message:'done.'
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );

	});


/*
    ////Register the public site/api
    this.setupSiteAPI('[resource]', publicLinks);
*/

} // end setup()


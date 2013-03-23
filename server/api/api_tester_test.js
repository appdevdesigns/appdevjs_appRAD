
/**
 * @class appRAD.server.api.Tester
 * @parent appRAD.server.api
 *
 * Performs the action (test) for tester.
 * @apprad resource:tester // @appradend (please leave)
 * @apprad action:test // @appradend (please leave)
 * @apprad url: // @appradend
 */


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var error = AD.Util.Error;
var errorDump = AD.Util.ErrorDump;
var $ = AD.jQuery;

var ErrorMSG = null;

var appRADTesterTest = new AD.App.Service({});
module.exports = appRADTesterTest;






////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.

if (!AD.Defaults.authRequired) {
    next();
} else {
    if (!AD.Defaults.authRequired) next();

    var permission = 'appRAD.tester.test';
    var viewer = AD.Viewer.currentViewer(req);

    log(req, '   - hasPermission(): checking for : '+permission);

    // if viewer has 'hris.person.findAll' action/permission
    if (viewer.hasTask(permission)) {

        log(req, '     viewer has permission: '+permission);
        next();

    } else {

        errorDump(req, '     viewer failed permission check!');
//        ErrorMSG(req, res, 'ERR_NO_PERMISSION', AD.Const.HTTP.ERROR_FORBIDDEN);  // 403 : you don't have permission

    } // end if
}
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



////---------------------------------------------------------------------
var testHRIS = function (req, res, next) {
// Make sure all required parameters are given before continuing.

    console.log('pulling objects:');

    var got = AD.Comm.HTTP.get({ uri:'http://localhost:8088/hris/api/object'});
    $.when(got).then(function(data){
        console.log(data);
        next();
    });
};




//these are our publicly available /site/api/appRAD/tester  links:
//note: in below definitions, any value in [] is a templated value replaced with the instances value for that attribute: [id] = obj.id;
//note: params are defined like:  params:{ requiredParam1:'[requiredParam1]', requiredParam2: '[requiredParam2]'}
var publicLinks = {
//     findAll: { method:'GET',    uri:'/appRAD/testers',     params:{}, type:'resource' },
//     findOne: { method:'GET',    uri:'/appRAD/tester/[id]', params:{}, type:'resource' },
//     create:  { method:'POST',   uri:'/appRAD/tester',      params:{}, type:'action' },
//     update:  { method:'PUT',    uri:'/appRAD/tester/[id]', params:{}, type:'action' },
//     destroy: { method:'DELETE', uri:'/appRAD/tester/[id]', params:{}, type:'action' },
    test: { method:'GET', uri:'/appRAD/tester/test', params:{}, type:'action' },
}

var serviceURL = publicLinks.test.uri.replace('[id]',':id');


var testerStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,		       // make sure we have permission to access this
        verifyParams,			   // make sure all required params are given
        testHRIS,                  // run through a test of the hris web services
//        step2, 	               // get a list of all Viewers
//        step3		               // update each viewer's entry
    ];


appRADTesterTest.setup = function( app ) {

//    ErrorMSG = this.module.Error;

	////---------------------------------------------------------------------
	app.get(serviceURL, testerStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/[serviceName]/[actionName]


	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /'+serviceURL+' (test) ');

	    var cond = {
	            objA_id:1,
	            'or':{
	                objB_id:2
	            },
	            objC_id:{ '>':1,
	                '<=':5,
	                'or':{
	                    '=':6
	                }
	            }
	    };

	    cond = {};

	    var conditionObj = AD.Model.Condition(cond);

	    console.log(conditionObj.sql());
	    console.log(conditionObj.values());

	    var condition = conditionObj.sql();
	    if (condition == '') console.log('sql is "" ')


	    // send a success message
	    var successStub = {
	            message:'done.'
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );

	});


/*
    ////Register the public site/api
    this.setupSiteAPI('tester', publicLinks);
*/

} // end setup()


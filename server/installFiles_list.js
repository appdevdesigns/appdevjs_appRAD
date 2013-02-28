
////
//// InstallFiles
////
//// Return all the install files found in our install directory
////
////    /appRAD/installFiles
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;


var appRADInstallFiles = new AD.App.Service({});
module.exports = appRADInstallFiles;




////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.installFiles.list' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

};



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['module']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var gatherList = function (req, res, next) {
    // Go ahead and gather the list of files
    
    var module = req.param('module');   
    var path = __appdevPath + '/modules/'+module+'/install/data';

    var filesDone = AD.Util.FS.filesSync(path,{recurseDir:true});
    $.when(filesDone).then(function(list){
        req.aRAD.list = list;
        next();
    })
    .fail(function(err){
        AD.Comm.Service.sendError(req, res, err, AD.Const.HTTP.ERROR_SERVER ); // 500 : something wrong on our end
    });
};



////---------------------------------------------------------------------
var makeObjects = function (req, res, next) {
    // convert list into an array of objects
    
    var listObjects = [];
    var list = req.aRAD.list;
    var module = req.param('module');
    
    for (var i=0; i< list.length; i++){
        var file = list[i];
        var obj = { id:file, name:file, module:module };
        listObjects.push(obj);
    }
    
    
    req.aRAD.listObj = listObjects;

    next();
    
}



// these are our publicly available /site/api/appRAD/module  links;
var publicLinks = {
        findAll: { method:'GET', uri:'/appRAD/installFiles', params:{module:'[module]'}, type:'resource' },
//        findOne: { method:'GET',  uri:'/appRAD/installFile/[id]', params:{}, type:'resource' },
//        create:  { method:'POST',  uri:'/appRAD/installFile', params:{name:'[name]'}, type:'action' },
//        update:  { method:'POST', uri:'/appRAD/installFile/[id]', params:{}, type:'action' } 
}



var installFilesStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,      // make sure we have permission to access this
        verifyParams,		// make sure all required params are given
        gatherList,         // search [module]/install/data,
        makeObjects         // we like our output in json/obj format
    ];
        



appRADInstallFiles.setup = function( app ) {
	
	////---------------------------------------------------------------------
	app.get('/'+this.module.name()+'/installFiles', installFilesStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/installFiles
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /appRAD/installFiles');

	    
	    // send a success message
	    AD.Comm.Service.sendSuccess(req, res, req.aRAD.listObj );

	});
	
	
	// Register our public api links
	this.setupSiteAPI('installFile', publicLinks);

} // end setup()


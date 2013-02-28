
////
//// appRADInstallSQLExport
////
//// Performs the actions for InstallSQLExport.
////
////    /installSQLExport 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var errorDump = AD.Util.ErrorDump;
var $ = AD.jQuery;

var AppRADInfo = require('./objects/appRADInfo.js');

var exec = require('child_process').exec;

////Create our Validation object
//var Validation = require(__appdevPath+'/server/objects/validation.js');
//var validation = new Validation();


var appRADInstallSQLExportCreate = new AD.App.Service({});
module.exports = appRADInstallSQLExportCreate;




////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.installSQLExport.create' action/permission
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = [ 'module']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



var sqlDumpApps = {
        'mysql':function(user, pass, dbName, tables, fileName){
            return 'mysqldump -u'+user+' -p'+pass+' --add-drop-table '+dbName+' '+tables+' > '+fileName;
        },
        'posgres':'?? dunno ??' // Need to fill this in when we have support for different dbs
}

////---------------------------------------------------------------------
var createCommand = function (req, res, next) {
    // compile the command to execute for sql dump.

    var module = req.param('module');
    
//console.log('::: Here with module['+module+']');
    
    var appRADInfo = new AppRADInfo(module);
    var data = appRADInfo.data();
    
    var tables = "";
    for (var t in data.sqlTables) {
        tables += ' '+t;
    };
    
    if (tables == "") {
        
        // No tables to export.
        // alert the user:
        var err = new Error(' no tables registered to export');
        
        errorDump(req, err)
        AD.Comm.Service.sendError(req, res, {errorID:22, errorMSG:err.message}, AD.Const.HTTP.ERROR_NOTFOUND ); // 404: no items found
        
    } else {
        
        // we have tables to export!
        
        var user = AD.Defaults.dbUser;
        var pass = AD.Defaults.dbPword;
        var dbName = AD.Defaults.dbName;
        
    //    var command = 'mysqldump -u'+user+' -p'+pass+' --add-drop-table '+dbName+' '+tables+' > setup_' + AD.Defaults.dataStoreMethod+'.sql';
        
        if ('undefined' != typeof sqlDumpApps[AD.Defaults.dataStoreMethod]) {
            var command = sqlDumpApps[AD.Defaults.dataStoreMethod](user, pass, dbName, tables, __appdevPath+'/modules/'+module+'/install/data/setup_' + AD.Defaults.dataStoreMethod+'.sql');
//console.log('::: and command['+command+']');
            req.aRAD.command = command;
            next();
        } else {
            var err = new Error(' unknown dataStoreMethod['+AD.Defaults.dataStoreMethod+']');
    
            errorDump(req, err)
            AD.Comm.Service.sendError(req, res, {errorID:23, errorMSG:err.message}, AD.Const.HTTP.ERROR_SERVER ); // 500 : our problem
        }
    
    }

};



////---------------------------------------------------------------------
var dumpTables = function (req, res, next) {
    // actually run the command

    var command = req.aRAD.command;
    
    
    exec(command, function(error, stdout, stderr){
       
        if (error !== null) {
            
            var err = new Error(' command failed:['+stderr+']');

            errorDump(req, err)
            AD.Comm.Service.sendError(req, res, {errorID:24, errorMSG:err.message}, AD.Const.HTTP.ERROR_SERVER ); // 500 : our problem
            
        } else {
            
            // no error, so assume it is good.
            next();
            
        }

    });
    

};

//these are our publicly available /site/api/appRAD/installSQLExport  links;
var publicLinks = {
        create:  { method:'POST',  uri:'/appRAD/installSQLExport', params:{module:'[module]'}, type:'action' },
}



var InstallSQLExportStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,		       // make sure we have permission to access this
        verifyParams,			   // make sure all required params are given
        createCommand,             // compile the command to execute for sql dump
        dumpTables,                // actually run the command

    ];
        


appRADInstallSQLExportCreate.setup = function( app ) {

	
	////---------------------------------------------------------------------
	app.post('/'+this.module.name()+'/installSQLExport', InstallSQLExportStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/[serviceName]/[actionName]
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /appRAD/installSQLExport ');
	    
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );  
	    
	});
	

    ////Register the public site/api
    this.setupSiteAPI('installSQLExport', publicLinks);
} // end setup()


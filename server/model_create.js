
////
//// Model Create
////
//// This service is created to handle requests to generate new Model 
//// definitions for a Module.
////
////    /appRad/model/create   : tableName=X, module=Y, ModelName=Z, primaryKey=K, labelKey=L
////        Creates a new model from DB table X  under application Module Y
////
////

var $ = AD.jQuery;
var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var myDB = AD.Model.Datastore.DB;


var appRADModelCreate = new AD.App.Service({});
module.exports = appRADModelCreate;


////
//// Setup the Model Template Definitions:
////
     


var listTemplatesModel = {
    '/modules/[myModuleName]/data/templates/server/modelSQL.js':{
            data:'',
            destDir:'/modules/[module]/models/[modelName].js',
            userManaged:false
    }
};
    







////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.Developer' action
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData );
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['module', 'modelName', 'tableName', 'primaryKey', 'labelKey']; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



////---------------------------------------------------------------------
var verifyModule = function(module) {
    // make sure the given module directory exists
    
    var dfd = $.Deferred();
    var path = __appdevPath + '/modules/' + module;
    fs.exists(path, function(isThere) {
     
        if ((!isThere) || (module == '')) {
            
            // directory doen't exists, this is a problem!
            var msg = 'provided Module Name ['+module+'] does not exists.';
            dfd.reject({errorMSG:msg});
    
        } else {
            
            dfd.resolve(true); 
        }
    });
    
    return dfd;
}



////---------------------------------------------------------------------
var verifyModelName = function(module, modelName) {
    // the given ModelName must be unique (no other one exists)
    
    var dfd = $.Deferred();
    var path = __appdevPath+'/modules/'+module+'/models/'+modelName+'.js';
    fs.exists(path, function(isThere) {
     
        if (isThere) {
            
            // this is a problem if there is already one there
            var msg = 'provided Model Name ['+modelName+'] already exists.';
            dfd.reject({errorMSG:msg});
    
        } else {
            
            dfd.resolve(true); 
        }
    });
    
    return dfd;
}



////---------------------------------------------------------------------
var verifyKeys = function(primaryKey, labelKey) {
    
    var dfd = $.Deferred();
    if (primaryKey == '') {

        dfd.reject({errorMSG:'primaryKey ['+primaryKey+'] invalid.'});
        
    } else if (labelKey == '') {

        dfd.reject({errorMSG:'labelKey ['+labelKey+'] invalid.'});
        
    } else {
        
        dfd.resolve(true);
    }
    
    return dfd;
}



////---------------------------------------------------------------------
var validateParams = function (req, res, next) {
    // Make sure provided parameters are valid.
    
    //// verify Module Name
    var module = req.param('module');
    var moduleCorrect = verifyModule(module);
       
    //// verify modelName (must be unique)
    var modelName = req.param('modelName');
    var modelNameCorrect = verifyModelName(module, modelName);
    
    
    //// Let's check the DB Table later ...
    
    //// verify primaryKey & labelKey are not ''
    var primaryKey = req.param('primaryKey');
    var labelKey = req.param('labelKey');
    var keysCorrect = verifyKeys(primaryKey, labelKey);
    
   
    
    
    // if everything passes, then continue on ...
    $.when(moduleCorrect, modelNameCorrect, keysCorrect).then(function(){
        
        next();
        
        
    }).fail(function(err){
     
        var err = {};
        for(var i=0; i< arguments.length; i++) {
            if (arguments[i]) {
                err = arguments[i];
            }
        }

        logDump(req, '  - error: ' + err.errorMSG);
        AD.Comm.Service.sendError(req, res, err, AD.Const.HTTP.ERROR_CLIENT ); // 400: your fault
    
    });
    
};



////---------------------------------------------------------------------
var loadDBTableInfo = function (req, res, next, nameField) {
    // attempt to load the db table info from the provided
    // tableName parameter.
    
    var dbName = req.param('dbName') || AD.Defaults.dbName;
    var tableName = req.param(nameField);

    
    // if no tableName given
    if (('undefined' == typeof tableName) || (tableName=='')) {
    
        log(req, 'no tableName:');
        log(req, 'nameField['+nameField+']');
        log(req, '  ');

        AD.Comm.Service.sendError(req, res, {errorMSG:nameField+' ['+tableName+'] not found '}, AD.Const.HTTP.ERROR_NOTFOUND );
        
    } else {

        var sql = 'DESCRIBE '+dbName+'.'+tableName;
        myDB.query(sql, [], function(err, results, fields) {
        
            if (err) {
            
                log(req, err);
                var errorMSG = {
                    errorMSG: ' table ['+tableName+'] not found. ',
                        data:err
                };
                
                AD.Comm.Service.sendError(req, res, errorMSG, AD.Const.HTTP.ERROR_NOTFOUND);
                
            } else {
               
                if (typeof req.aRAD == 'undefined') req.aRAD = {};
                if (typeof req.aRAD.service == 'undefined') req.aRAD.service = {};
                req.aRAD.service[''+nameField]=results;
                next();
            }
        
        });
        
    } // end if tableName found

}



////---------------------------------------------------------------------
var propertyList = function( req, name) {

    // the property list is created from the sql table description:
    var propertyList = '';
    var results = req.aRAD.service[name];
    for (var ri=0; ri < results.length; ri++) {
        var type = simpleType(results[ri].Type);
        propertyList += '                  '+results[ri].Field + ':"' + type + '"'+(ri === results.length-1 ? '' : ',')+'\n';
        
    }
    
    return propertyList;

}



////---------------------------------------------------------------------
var simpleType = function (type) {
    // take the given db field type and return a simpler version for our
    // framework to use:
    
    
    // get info before '('
    // switch part0
    //      case 'varchar':
    //      case 'text':
    //          return 'text';
    //      break;
    //      case float:
    //      case int:
    //          return 'number';
    //      case date
    //      case datetime
    //          return 'date';
    // end switch
    
    return type;
}



////---------------------------------------------------------------------
var initData = function (req, res, next) {
    // Gather the required Data for this operation.
    
    
    // a list of the required tags necessary in order to complete the
    // templates.  These tags should be supplied via the service call:
    var dListTags = {
        module:'?module?',
        modelName:'?ModelName?',
        dbName:AD.Defaults.dbName,
        tableName:'?tableName?',
        primaryKey:'?primaryKey?',
        labelKey:'?labelKey?'
        
    };
    
    var listTags = {};
    
    //// Build the DB property List:
    listTags.propertyList= propertyList(req, 'tableName' );
    
    var ignoreFields = {'propertyList':''};
    
    
    
    
    // load Template tags for this model
    for (var ti in dListTags) {
    
        if (typeof ignoreFields[ti] == 'undefined') {
            
            listTags[ti] = req.param(ti);
            if ('undefined' == typeof listTags[ti]) {
                listTags[ti] = dListTags[ti];
            }
            
        }
    }
    
    
    // if dbName == our defaults, then don't need to specify it:
    if (listTags.dbName == AD.Defaults.dbName) {
        listTags.dbName = "//            dbName:AD.Defaults.dbName,";
    } else {
        listTags.dbName = "            dbName:'"+listTags.dbName+"',";
    }

    
    // now create the templates:
    var templateDone = templateToolModel.createTemplates(listTags);
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




// be sure to run through these filters before accessing our Create
// Model service:

//// Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateToolModel = new TemplateTools({
    listTemplates:listTemplatesModel,
});


var preLoadDBInfo = function (req, res, next) { 
    loadDBTableInfo(req, res, next, 'tableName'); 
}

var modelStack = [
        AD.App.Page.serviceStack,
        hasPermission,  // make sure we have permission to access this
        verifyParams,   // make sure our required Params are given
        validateParams, // make sure given params are valid
        preLoadDBInfo,  // prepare the DB Table Info 
        initData,       // prepare data (name & listTags)    
        ];
        



appRADModelCreate.setup = function(app) {

    ////---------------------------------------------------------------------
    app.all('/'+this.module.name()+'/model', modelStack, function(req, res, next) {
        //// Creates a new model from DB table X  under application Module Y
        // test using: http://localhost:8085/appRad/model?module=test&ModelName=Settings&tableName=site_settings&primaryKey=settings_id&labelKey=settings_label
    
        
        // By the time we get here, all the processing has taken place.
    
        AD.Util.LogDump(req, 'finished');
        
        
        // send a success message
        AD.Comm.Service.sendSuccess(req, res, {message:'all model templates written.' } );
    });

    
    
    //// Prepare to load our templates:
    // update our paths to use our module.name()
    var data = {myModuleName:this.module.name()};
    for (var a in listTemplatesModel){
        
        ////   a is our path template, so take it's value
        var entry = listTemplatesModel[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesModel[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesModel[a];
    }

    
    
    // Asynchronously Load our Model templates 
    for (var ti in listTemplatesModel) {

        var path = __appdevPath+ti;
        templateToolModel.loadTemplate(ti, path, listTemplatesModel);
        
    }

    
    
    
    
}
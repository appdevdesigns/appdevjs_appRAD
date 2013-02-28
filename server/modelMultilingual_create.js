//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   modelMultilingual       : the name of this service :  (lowercase)
//   ModelMultilingual   : the name of this service :  (Uppercase)
//   Create	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')

/**
 * @class appRAD.server.module_apis.modelMultilingual
 * @parent appRAD.server.module_apis
 * 
 * Performs the actions for [resource].
 * @apprad resource:[resource] // @appradend (please leave)
 * @apprad action:create // @appradend (please leave)
 * @apprad url:[url] // @appradend
 */


////
//// appRADModelMultilingual
////
//// Performs the actions for [resource].
////
////    /[resource] 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;
var myDB = AD.Model.Datastore.DB;



////Create our Validation object
//var Validation = require(__appdevPath+'/server/objects/validation.js');
//var validation = new Validation();


var appRADModelMultilingualCreate = new AD.App.Service({});
module.exports = appRADModelMultilingualCreate;





var listTemplatesMultilingual = {
    '/modules/[myModuleName]/data/templates/server/modelSQLMultilingual.js':{
        data:'',
        destDir:'/modules/[module]/models/[modelName].js',
        userManaged:false
    }
};
    
    



////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.modelMultilingual.create' action/permission
        next();
    // else
        // var errorData = { errorID:55, errorMSG:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['module', 'modelName', 'tableNameData', 'tableNameTrans', 'primaryKey', 'labelKey']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};




////---------------------------------------------------------------------
var propertyList = function( req, name) {
    
    // the property list is created from the sql table description:
    var propertyList = '';
    var results = req.aRAD.service[name];
    for (var ri=0; ri < results.length; ri++) {
        var type = results[ri].Type; // simpleType(results[ri].Type);
        propertyList += '                  '+results[ri].Field + ':"' + type + '"'+(ri === results.length-1 ? '' : ',')+'\n';
        
    }
    
    return propertyList;

}



////---------------------------------------------------------------------
var initMLData = function (req, res, next) {
    // Gather the required Data for this operation.
    
    
    
    // a list of the required tags necessary in order to complete the
    // templates.  These tags should be supplied via the service call:
    var listTags = {
        module:'?module?',
        modelName:'?modelName?',
        ModelName:'?ModelName?',
        dbName:AD.Defaults.dbName,
        tableNameData:'?tableNameData?',
        propertyListData:'?propertyListData?',
        tableNameTrans:'?tableNameTrans?',
        propertyListTrans:'?propertyListTrans?',
        listMultilingualFields:'?listMultilingualFields?',
        primaryKey:'?primaryKey?',
        labelKey:'?labelKey?'
        
    };
    
    
    
    
    var ignoreFields = {'propertyListData':'', 'propertyListTrans':'', 'listMultilingualFields':''};
    
    
    
    
    // load Template tags for this model
    for (var ti in listTags) {
    
        if (typeof ignoreFields[ti] == 'undefined') {
            
            var value = req.param(ti);
            if (typeof value != 'undefined') {
                listTags[ti] = value;
            } 
        }
    }
    
    
    // build the uppercase ModelName
    var name = listTags.modelName;
    listTags.ModelName = name.charAt(0).toUpperCase() + name.substr(1);
 
    
    
    //// Build the DB property List:
    // the property list is created from the sql table description
    listTags.propertyListData= propertyList(req, 'tableNameData' );
    listTags.propertyListTrans= propertyList(req, 'tableNameTrans' );
    

    //// Build the list of Multilingual Fields
    var listFields = '';
    for (var s=0; s<req.aRAD.service.tableNameTrans.length; s++) {
        var field = req.aRAD.service.tableNameTrans[s].Field;
        if ((field.indexOf('_id') == -1)
             && (field != listTags.primaryKey)
             && (field != 'language_code')) {
            
            if (listFields != '') listFields += ', ';
            listFields += "'" + field + "'";
        }
    }
    listTags.listMultilingualFields = listFields;
    
    
    console.log(':::::::::::: ListTags Data ::::::::');
    console.log(listTags);
    console.log('');


    // save our data for the template tools        
    var templateDone = templateToolMLModel.createTemplates(listTags);
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




////Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateToolMLModel = new TemplateTools({
    listTemplates:listTemplatesMultilingual,
});





////---------------------------------------------------------------------
var loadDBTableInfo = function (req, res, next, nameField) {
    // attempt to load the db table info from the provided
    // tableName parameter.
    
    var dbName = req.param('dbName') || AD.Defaults.dbName;
    var tableName = req.param(nameField);

    
    // if no tableName given
    if (('undefined' == typeof tableName) || (tableName=='')) {
    
        AD.Util.Log(req, 'no tableName:');
        AD.Util.Log(req, 'nameField['+nameField+']');
        AD.Util.Log(req, '  ');
    
        AD.Comm.Service.sendError(req, res, {errorData:nameField+' not found ['+tableName+']'}, AD.Const.HTTP.ERROR_CLIENT );
        
    } else {
    
        var sql = 'DESCRIBE '+dbName+'.'+tableName;
        myDB.query(sql, [], function(err, results, fields) {
        
            if (err) {
            
                AD.Util.Log(req, err);
                var errorData = {
                    err: err
                };
                
                AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_SERVER );
                
            } else {
               
                if (typeof req.aRAD == 'undefined') req.aRAD = {};
                if (typeof req.aRAD.service == 'undefined') req.aRAD.service = {};
                req.aRAD.service[''+nameField]=results;
                next();
            }
        
        });
        
    } // end if tableName found

}




var preLoadDBInfoData = function (req, res, next) { 
    loadDBTableInfo(req, res, next, 'tableNameData'); 
}
var preLoadDBInfoTrans = function (req, res, next) { 
    loadDBTableInfo(req, res, next, 'tableNameTrans'); 
}






////Create our Template Tools object
var templateToolMLModel = new TemplateTools({
    listTemplates:listTemplatesMultilingual,
});



// these are our publicly available /site/api/appRAD/modelMultilingual  links:
// note: in below definitions, any value in [] is a templated value replaced with the instances value for that attribute: [id] = obj.id;
// note: params are defined like:  params:{ requiredParam1:'[requiredParam1]', requiredParam2: '[requiredParam2]'}
var publicLinks = {
//        findAll: { method:'GET',    uri:'/appRAD/modelMultilinguals', params:{}, type:'resource' },
//        findOne: { method:'GET',    uri:'/appRAD/modelMultilingual/[id]', params:{}, type:'resource' },
//        create:  { method:'POST',   uri:'/appRAD/modelMultilingual', params:{}, type:'action' },
//        update:  { method:'PUT',    uri:'/appRAD/modelMultilingual/[id]', params:{module:'appRAD', page: '[page]'}, type:'action' },
//        destroy: { method:'DELETE', uri:'/appRAD/modelMultilingual/[id]', params:{}, type:'action' },
        create:  { method:'POST',   uri:'/appRAD/modelMultilingual', params:{ module:'[module]', modelName:'[modelName]', tableNameData:'[tableNameData]', tableNameTrans:'[tableNameTrans]', primaryKey:'[primaryKey]', labelKey:'[labelKey]'}, type:'action' }, 
}

var serviceURL = publicLinks.create.uri.replace('[id]',':id');

var modelMultilingualStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,		       // make sure we have permission to access this
        verifyParams,			   // make sure all required params are given
        preLoadDBInfoData,  // load the Data table info
        preLoadDBInfoTrans, // load the Trans table info
        initMLData,         // prepare data (name & listTags) (Multilingual)    
   
];
        

appRADModelMultilingualCreate.setup = function( app ) {

	
	////---------------------------------------------------------------------
	app.post(serviceURL, modelMultilingualStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/modelMultilingual
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /appRAD/modelMultilingual (create)');
	    
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );  
	    
	});
	
	
	
	////Prepare to load our templates:
    // update our paths to use our module.name()
    var data = {myModuleName:this.module.name()};
    for (var a in listTemplatesMultilingual){
        
        ////   a is our path template, so take it's value
        var entry = listTemplatesMultilingual[a];
        
        // convert a -> a2 with our proper moduleName inserted
        var a2 = AD.Util.String.render(a, data);
        
        // add an [a2] entry
        listTemplatesMultilingual[a2] = entry;
        
        // delete our old [a] entry
        delete listTemplatesMultilingual[a];
    }
    
    
    
    // Asynchronously Load our Multilingual templates 
    for (var ti in listTemplatesMultilingual) {

        var path = __appdevPath+ti;
        templateToolMLModel.loadTemplate(ti, path, listTemplatesMultilingual);
        
    }
	

    ////Register the public site/api
    this.setupSiteAPI('modelMultilingual', publicLinks);
} // end setup()


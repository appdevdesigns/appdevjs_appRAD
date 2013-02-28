//// Template Replace:
//   appRAD     : the name of this interface's module: (lowercase)
//   labelImport       : the name of this service :  (lowercase)
//   LabelImport   : the name of this service :  (Uppercase)
//   Create	  : the action for this service : (lowercase) (optional).
//    : a list of required parameters for this service ('param1', 'param2', 'param3')

/**
 * @class appRAD.server.module_apis.labelImport
 * @parent appRAD.server.module_apis
 * 
 *  Performs the actions for [resource].
 */


////
//// appRADLabelImport
////
//// Performs the actions for [resource].
////
////    /[resource] 
////
////


var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;

var Label = AD.Model.List['site.Labels'];


////Create our Validation object
//var Validation = require(__appdevPath+'/server/objects/validation.js');
//var validation = new Validation();


var appRADLabelImportCreate = new AD.App.Service({});
module.exports = appRADLabelImportCreate;






////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.labelImport.create' action/permission
        next();
    // else
        // var errorData = { errorID:55, errorMSG:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN ); // 403 : you don't have permission
    // end if

}



////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
	
	var listRequiredParams = ['path', 'file']; // each param is a string
	AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};







var loadFile = function (filepath) {
    // paths should be from /root/modules 
    var basedir = fs.realpathSync(__appdevPath + '/modules');
    return fs.readFileSync(basedir + filepath, 'utf8');
}


var loadDirectory = function (dirpath) {
    
    // scan all the directory for possible labels and install
    // them.    
        
    var dirlist =  fs.readdirSync(dirpath);
    var allcontents = '';
    
    for (var i=0; i<dirlist.length; i++) {
        if (dirlist[i].match(/\.po$/) != null) {
            allcontents += loadFile(dirpath + dirlist[i]);
        }
    }

    return allcontents;
};


//read the module's source language labels from the database
var loadData = function(req, res, next) {
 
    var all_paths =  req.param('path');
    var all_files =  req.param('file');
     
    var paths = all_paths.split(',');
    var files = all_files.split(',');
     
    var readydata = [];
    var all_contents = '';
    if (paths.length > 0) {
         
         for (var i=0; i<paths.length; i++) {
             
             if (files.length >0) {
                 for (var ii=0; ii<files.length; ii++) {
                     all_contents += loadFile(paths[i] + '/' + files[ii]);
                 }
             } else {
                 all_contents += loadDirectory(paths[i]);
             }
             
         }
         
         var allcontentssplit = all_contents.split(/\r?\n\s*\r?\n/);
    
         for (var i=0; i<allcontentssplit.length; i++)
         {
             var newstr = trim(allcontentssplit[i]);
             if (newstr != '') {

                 var iscomment = false;
                 var thepath = newstr.match(/path\: .*/) == null ? iscomment = true : newstr.match(/path\: .*/)[0].replace('path: ', '').trim() ;
                 var thecode = newstr.match(/code\: .*/) == null ? iscomment = true : newstr.match(/code\: .*/)[0].replace('code: ', '').trim() ;
                 var thekey = newstr.match(/key\: .*/) == null ? iscomment = true : newstr.match(/key\: .*/)[0].replace('key: ', '').trim() ;
                 var thestr = newstr.match(/(?:msgstr ")(.*)(?:"$)/) == null ? iscomment = true : newstr.match(/(?:msgstr ")(.*)(?:"$)/)[1].trim() ;

                 if (!iscomment) {
                     readydata.push({ 
                         label_path: thepath,
                         language_code: thecode, 
                         label_key: thekey, 
                         label_lastMod: new Date(),
                         label_needs_translation: '0',
                         label_label: thestr});
                 }
             }
         }
     
    }
    req.aRAD.readydata = readydata;
     
    next();
}





var grabAllLabels = function(alabel) {

    var code = alabel['language_code'];
    var path = alabel['label_path'];
    var key = alabel['label_key'];
    
    var atPos = key.indexOf('?');
    if (atPos == -1) {
    
//        var conditionDest = "language_code='" + code + "' AND label_path='" + path + "' AND label_key='" + key + "'";
//        var filter = { language_code:code, label_path:path, label_key:key };
        Label.findAll({ language_code:code, label_path:path, label_key:key }, function(resultArray) {
            
            //Log(resultArray);
            if (resultArray.length == 0) {
                
                Label.create(alabel, function(resultArrayc) {
                    log('Imported label ' + resultArrayc['label_id']);
                });
                
            } else {
                var id = resultArray[0].label_id;
                
 //               alabel['dbCond'] = conditionDest;
                Label.update(id, alabel,function(resultArrayu) {
                    log('Updated label ['+key+']');
                }, function(erru) { log(erru); });
                
            }
        });
    
    } else {
    
        log('   *** label key['+key+'] had a "?" in it which gives us some problems! ');
    
    }
}


// write .po entries to database
var importData = function(req, res, next) {
    
    var labelsImport = req.aRAD.readydata;
    
    
    for (var i=0; i< labelsImport.length; i++) {
        
        grabAllLabels(labelsImport[i]);
        
        
    }
        
    AD.Comm.Service.sendSuccess(req, res, { 
        message:             
            labelsImport.length + ' labels imported.'
    } );
}



var trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};



// these are our publicly available /site/api/appRAD/labelImport  links:
// note: in below definitions, any value in [] is a templated value replaced with the instances value for that attribute: [id] = obj.id;
// note: params are defined like:  params:{ requiredParam1:'[requiredParam1]', requiredParam2: '[requiredParam2]'}
var publicLinks = {
//        findAll: { method:'GET',    uri:'/appRAD/labelImports', params:{}, type:'resource' },
//        findOne: { method:'GET',    uri:'/appRAD/labelImport/[id]', params:{}, type:'resource' },
//        create:  { method:'POST',   uri:'/appRAD/labelImport', params:{}, type:'action' },
//        update:  { method:'PUT',    uri:'/appRAD/labelImport/[id]', params:{module:'appRAD', page: '[page]'}, type:'action' },
//        destroy: { method:'DELETE', uri:'/appRAD/labelImport/[id]', params:{}, type:'action' },
        create:  { method:'POST',   uri:'/appRAD/labelImport', params:{file:'[file]', path:'[path]'}, type:'action' }, 
}

var serviceURL = publicLinks.create.uri.replace('[id]',':id');

var labelImportStack = [
        AD.App.Page.serviceStack,  // authenticates viewer, and prepares req.aRAD obj.
        hasPermission,		       // make sure we have permission to access this
        verifyParams,			   // make sure all required params are given
        loadData,                  // read in the data from the files
        importData
//        step2, 	               // get a list of all Viewers
//        step3		               // update each viewer's entry
    ];
        

appRADLabelImportCreate.setup = function( app ) {

	
	////---------------------------------------------------------------------
	app.post(serviceURL, labelImportStack, function(req, res, next) {
	    // test using: http://localhost:8088/appRAD/labelImport
	
	
	    // By the time we get here, all the processing has taken place.
	    logDump(req, 'finished /appRAD/labelImport (create)');
	    
	    
	    // send a success message
	    var successStub = {
	            message:'done.' 
	    }
	    AD.Comm.Service.sendSuccess(req, res, successStub );  
	    
	});
	

    ////Register the public site/api
    this.setupSiteAPI('labelImport', publicLinks);
} // end setup()



////
//// Labels Export
////
//// This service is designed to take all the labels of a module from the 
//// database and export them as a gettext (.PO) file.
////
////    /appRad/labels/export   : module=M & destLang=X [& srcLang=Y] 
////                                [& fileDest=Z]
////        Creates a new .po file:  
////                    /root/modules/[M]/install/data/labels_[X].po
////        or:
////                    as specified by [Z]
////
//// srcLang is optional and will be the site default language if not specified.
////
//// The saved .po file name will only contain the target language,
//// regardless of what the source language is.
////
//// fileDest can either be a full absolute directory path, or a relative path
//// to the appDev base directory. If the given path is invalid, the default
//// will be used instead.
////


////
//// Setup the Template Definitions:
////

//// NOTE: the keys in listTemplatesModel & listDestinationsModel must match.
////       

var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var $ = AD.jQuery;
fs = require('fs');

var AppRADInfo = require('./objects/appRADInfo.js');
var Label = require(__appdevPath + '/modules/site/models/Labels.js');


var appRADLabelExport = new AD.App.Service({});
module.exports = appRADLabelExport;


////---------------------------------------------------------------------
var hasPermission = function (req, res, next) {
    // Verify the current viewer has permission to perform this action.


    // if viewer has 'appRAD.Developer' action
        next();
    // else
        // var errorData = { message:'No Permission' }
        // AD.Comm.Service.sendError(req, res, errorData, AD.Const.HTTP.ERROR_FORBIDDEN  );
    // end if

}






////---------------------------------------------------------------------
var verifyParams = function (req, res, next) {
    // Make sure all required parameters are given before continuing.
    
    var listRequiredParams = ['module', 'destLang' ]; // each param is a string
    AD.Util.Service.verifyParams(req, res, next, listRequiredParams);
};



// Supposed to be like the PHP isset()
var isset = function(thing) {
    if (typeof thing == 'undefined') {
        return false;
    }
    return true;
}



////---------------------------------------------------------------------
var initData = function (req, res, next) {
    // Gather the required Data for this operation.


    var module = req.param('module');   
    var langSrc = req.param('srcLang') || AD.Defaults.langDefault || 'en';     // (optional) if not given defaults to AD.Defaults.langDefault
    var langDest = req.param('destLang');   
    var fileDest = req.param('fileDest') || null;  // (optional)
    
    
    // get list of label paths to pull from:
    var appRADInfo = new AppRADInfo(module);
    var data = appRADInfo.data();
    var pathKeys = [];
    for (var p in data.labels.installed) {
        pathKeys.push(p);
    }
    

    if (pathKeys.length > 0 ) {
        
        
        req.aRAD.module = module;
        req.aRAD.pathKeys = pathKeys;
        req.aRAD.langSrc = langSrc;
        req.aRAD.langDest = langDest;
        req.aRAD.fileDest = fileDest;

        // Labels will be semi-parsed and stored here after being read 
        // from the DB, 
        req.aRAD.labelsExport = {};

        // This is the final array of labels that will be sent to the template
        // to become the .PO gettext file.
        req.aRAD.arayFinal = [];
        
        next();
        
        
    } else {
        
        // there are no paths registered to export.
        // this isn't an error, but we don't need to do anything else:
        
        
        // send a success message
        AD.Comm.Service.sendSuccess(req, res, {message:'no paths registered to export.' } );

    }
    
}



var readSourceLabels = function(req, res, next) {
    // read the module's source language labels from the database
    
    var langSrc = req.aRAD.langSrc;
    var module = req.aRAD.module;
    var pathKeys = req.aRAD.pathKeys;
    
    var totalOps = pathKeys.length;
    var opsDone = 0;
    
    for (var pK=0; pK<totalOps; pK++) {
        
        // Read out all the labels from the module
//var conditionSrc = "label_path LIKE '%" + pathKey +"%' AND language_code = '" + langSrc + "'";
        
        var conditionSrc = {
                label_path: {'like': pathKeys[pK] },
                language_code: langSrc
        }
//console.log(conditionSrc);
        Label.findAll(conditionSrc, function(resultArray) {
//console.log(resultArray);

                // Parse the source labels
                var labelsExport = req.aRAD.labelsExport;
                for (var i=0; i<resultArray.length; i++) {
                    var thisLabel = resultArray[i];
                    
                    // path
                    var labelPath = thisLabel['label_path'];
                    if (typeof labelsExport[labelPath] == 'undefined') {
                        labelsExport[labelPath] = {};
                    }
                    
                    // path -> key
                    var key = thisLabel['label_key'];
                    if (typeof labelsExport[labelPath][key] == 'undefined') {
                        labelsExport[labelPath][key] = {}
                    }
                    
                    // path -> key -> lang
                    var lang = thisLabel['language_code'];
                    labelsExport[labelPath][key][lang] = thisLabel['label_label'];
                }
                
                opsDone++;
                if (opsDone >= totalOps) {
//console.log('');
//console.log('readSourceLabels(): labelsExport:')
//console.log(labelsExport);                    
                    // we've completed all the different label path lookups:
                    next();
                }
        });
    
    }

}


// read the module's destination language labels from the database
var readDestLabels = function(req, res, next) {

    var langDest = req.aRAD.langDest;
    var module = req.aRAD.module;
    var pathKeys = req.aRAD.pathKeys;
    
    var totalOps = pathKeys.length;
    var opsDone = 0;
    
    for (var pK=0; pK<totalOps; pK++) {
        
    
    // Read out all the labels from the module
//var conditionDest = "label_path LIKE '%" + pathKey +"%' AND language_code = '" + langDest + "'";
        var conditionDest = {
                label_path: {'like': pathKeys[pK] },
                language_code: langDest
        }
//console.log(conditionDest);
        
        
    Label.findAll(conditionDest,function(resultArray) {

            // Parse the destination labels
            var labelsExport = req.aRAD.labelsExport;
            for (var i=0; i<resultArray.length; i++) {
                var thisLabel = resultArray[i];
                
                // path
                var labelPath = thisLabel['label_path'];
                if (typeof labelsExport[labelPath] == 'undefined') {
                    labelsExport[labelPath] = {};
                }
                
                // path -> key
                var key = thisLabel['label_key'];
                if (typeof labelsExport[labelPath][key] == 'undefined') {
                    labelsExport[labelPath][key] = {}
                }
                
                // path -> key -> lang
                var lang = thisLabel['language_code'];
                labelsExport[labelPath][key][lang] = thisLabel['label_label'];
            }

            opsDone++;
            if (opsDone >= totalOps) {
//console.log('');
//console.log('readDestLabels(): labelsExport:')
//console.log(labelsExport);                    
                // we've completed all the different label path lookups:
                next();
            }
    });
    
    }

}


/**
 * Create the .PO gettext file from the parsed labels
 */
var createExport = function(req, res, next) {
    
    var labelsExport = req.aRAD.labelsExport;
    var langSrc = req.aRAD.langSrc;
    var langDest = req.aRAD.langDest;
    
    // Final parsing
    var arrayFinal = [];
    var labelsTracker = [];
    for (var labelPath in labelsExport) {
        for (var key in labelsExport[labelPath]) {
        	var source = labelsExport[labelPath][key][langSrc];
            var dest = labelsExport[labelPath][key][langDest];
            // Fill in any missing source/destination labels
            if (!dest) {
            	dest = source;
            }
            if (!source) {
            	source = dest;
            } else {            	
            	if (labelsTracker.indexOf(source) != -1)
            		source = '(translators ignore this tag:[' + labelsTracker.length + ']) ' + source;
            	
        		labelsTracker.push(source);
            }
            
            // Escape unsafe characters
            source = source
                .replace(/"/gm, '\\"')
                .replace(/[\n\r]/gm, '\\n');
            dest = dest
                .replace(/"/gm, '\\"')
                .replace(/[\n\r]/gm, '\\n');
            // Ready for the template
            arrayFinal.push({
                'label_path': labelPath,
                'label_key': key,
                'label_source': source,
                'label_label': dest
            });
        }
    }

    // Use the EJS template to create the .po file
    var templateName = appRADLabelExport.module.path() + '/data/templates/server/po.ejs';
    var templateStr = fs.readFileSync(templateName, 'utf8');
    var thisEJS = require(__appdevPathNode + 'ejs');
    var poString = thisEJS.render(templateStr, {
        locals: {
            'labels': arrayFinal,
            'moduleKey': req.aRAD.module,
            'sourceLangCode': langSrc,
            'targetLangCode': langDest
        }
    });
    
    //// Save the .po file
    // Default is to use the module's install/data directory.
    var poFileName = 'labels_' + langDest + '.po';
    var poFilePath = ''
        + __appdevPath
        + '/modules/' + req.aRAD.module + '/install/data/'
        + poFileName;
    // But the location may also be passed in using 'fileDest'
    if (req.aRAD.fileDest) {
        var fileDest = req.aRAD.fileDest;
        // relative path
        if (fileDest.charAt(0) != '/') {
            // convert to absolute
            var fileDest = __appdevPath + '/' + fileDest;
        }
        // Only allow destinations within the appDev framework hierarchy
        if (fileDest.indexOf(__appdevPath) == '0') {
            // No using '../../' to break out
            var afterAppDev = fileDest.substr( __appdevPath.length );
            if (afterAppDev.indexOf('../') == -1) {
                // Make sure directory exists
                if (fs.existsSync(fileDest)) {
                    var stat = fs.statSync(fileDest);
                    if (stat.isDirectory()) {
                        // Confirmed that the given 'fileDest' is valid!
                        // Use that instead of the default
                        poFilePath = fileDest + '/' + poFileName;
                    }
                    else {
                        console.log(' -- fileDest must be a directory');
                    }
                }
                else {
                    console.log(' -- fileDest directory path does not exist');
                }
            }
            else {
                console.log(' -- fileDest path cannot use ../');
            }
        }
        else {
            console.log(' -- fileDest path must be inside appDev hierarchy');
        }
    }

    fs.writeFile(poFilePath, poString, 'utf8', function() {
    
        req.aRAD.poFilePath = poFilePath;
        
        next();
    });
    
    
}


//// Define functions for passing control to our templateTool object:
var createDirectory = function (req, res, next) { 

    var listTags= {module:req.aRAD.module};

    var done = templateTool.createDirectory(listTags); 
    $.when(done)
        .then(function(data) {
            next();
        })
        .fail(function(err){
            AD.Comm.Service.sendError(req, res, {err:err}, AD.Const.HTTP.ERROR_SERVER  ); // 500 : our problem
        });
}


// list of directories that need to be created for the Module
var listDestinationsDirectories = {
    '/modules/[module]/install/data': '-',
    };

//// Create our Template Tools object
var TemplateTools = require('./objects/templateTools.js');
var templateTool = new TemplateTools({
    listDirectories: listDestinationsDirectories
});


//these are our publicly available /site/api/appRAD/labelExport  links;
var publicLinks = {
        create:  { method:'POST',  uri:'/appRAD/labels/export', params:{module:'[module]', destLang:'[destLang]'}, type:'action' },
}


//// perform these actions in sequence:
var moduleStack = [
    AD.App.Page.serviceStack,   // authenticates viewer, and prepares req.aRAD obj.
    hasPermission,              // make sure we have permission to access this
    verifyParams,               // make sure all required params are given
    initData,                   // prepare data (name & listTags)    
    createDirectory,            // verify all the Directories exist
    readSourceLabels,
    readDestLabels,
    createExport
    ];
        

        
appRADLabelExport.setup = function(app) {


    ////---------------------------------------------------------------------
    app.post('/'+this.module.name()+'/labels/export', moduleStack, function(req, res, next) {
        //// Exports a set of labels from a module to gettext format for translation
        // test using: http://localhost:8088/appRad/labels/export?module=site&pathKey=page/site&destLang=zh-hans&srcLang=en
    
        
        // by the time we enter this, we should have done all our steps
        // for this operation.
        logDump(req,'  - finished writing .PO file ('+req.aRAD.poFilePath+')');

        // send a success message
        AD.Comm.Service.sendSuccess(req, res, {message:'poFilePath: ' + req.aRAD.poFilePath } );

    });
    
    
    // Register our public api links
    this.setupSiteAPI('labelExport', publicLinks);
    
}
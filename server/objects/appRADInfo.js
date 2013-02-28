////
//// RadTools
////
//// This object provides common routines that are shared among our
//// Services.
//// 
//// 

var cache = {};

var $ = AD.jQuery;

/**
* 
* @class appRAD.server.objects.appRADInfo
* @parent appRAD.server.objects
* 
* This object manages the .appRAD.info file that is stored in the 
* root directory of our modules.  this .info file contains various 
* appRAD settings that need to be persistent among development instances.
*
* @param {string} moduleName
* 				The module name that this instance of appRADInfo should work 
* 				with.
*/

function appRADInfo( moduleName ) {

    this.path = '';
    
    this._data = null;
    
    
    if ('undefined' == typeof moduleName) moduleName = '';
    
    this.moduleName = moduleName;
    
    if (moduleName != '') {
    	this.loadModule(moduleName);
    }
    
};
module.exports = appRADInfo;



// creating the appRAD.info file requires these tags in our templateTools obj
appRADInfo.prototype.templateTags = function () {
    return {
    	module: '?module?',
    	appRADInfo: '?appRADInfo?'  // basically just storing 1 JSON obj
    };
}



/*
** 
* @function create
* @parent appRADInfo
* 
* This method creates a new instance of the .appRAD.info file.
*
* @param {object} req
* 				The express request object
* @param {object} res
* 				The express response object
* @param {function} next
* 				The express next object
*/
appRADInfo.prototype.create = function () {
    var dfd = $.Deferred();
    
    // if we haven't created a new _data then do so now...
    if (null == this._data) {
        this.newData();
    }
    
    // since we are creating this:
    var templateData = this.templateData(this._data);

    
    var templateDone = templateTool.createTemplates(templateData);
    $.when(templateDone)
        .then(function(data){
            dfd.resolve(data);
        })
        .fail(function(err){
            dfd.reject(err);
        });
  
    return dfd;
    
}



/*
** 
* @function data
* @parent appRADInfo
* 
* Returns the JSON data of the .appRAD.info file.
*
* @param {string} moduleName
* 			Optional name of a module to return the data for.  (setting this will override the initial 
* 			moduleName provided on object creation).
*/
appRADInfo.prototype.data = function (moduleName) {
	
	if ('undefined' == typeof moduleName) {
		moduleName = this.moduleName;
	}
	
	if (this._data == null) {
		
		if (moduleName != '') {
		    
		    if (!this.exists(moduleName)) {
		        
		        // create a new entry
		        this.newData();
		        
		    } else {
		        
		        // load that data
		        this.loadModule(moduleName);
		    }
		}
		
	}
	

	return this._data;
}



//return our .appRAD.info 
appRADInfo.prototype.dataFromPath = function (path) {
	
	if ('undefined' == typeof cache[path]) {
		
		var data = require(path);
		cache[path] = data;
	}

	
	return cache[path];
}



/*
** 
* @function exists
* @parent appRADInfo
* 
* Returns whether or not an .appRAD.info file exists for this moduleName.
*
* @param {string} moduleName
* 			Optional name of a module to return the data for.  
*/
// does the given moduleNme have an appRAD.info file?
appRADInfo.prototype.exists = function (moduleName) {
	
	if ((typeof moduleName == 'undefined') || (moduleName == '')) {
		moduleName = this.moduleName;
	}
	var filePath = this.pathFromModule(moduleName);
	
	if ('undefined' != typeof cache[filePath]) {
		// we've already cached that one so yes:
		return true; 
		
	} else {
		
		// look it up using fs
		return fs.existsSync(filePath);
	}
	
}



// loads the .appRAD.info from the given moduleName
appRADInfo.prototype.loadModule = function( moduleName) {
	
	var pathInfo = this.pathFromModule( moduleName);
	
	this.moduleName = moduleName;
	this.path = pathInfo;
	
	if ( 'undefined' != typeof cache[pathInfo]) {
		
		this._data = cache[pathInfo];
		
	} else {
		
		if (fs.existsSync(pathInfo)) {
			var data = require(pathInfo);
			cache[pathInfo] = data;
			this._data = data;
		}
		
	}
}



/*
** 
* @function newData
* @parent appRADInfo
* 
* Creates a new JSON Data object for the specified moduleName.
*
* @param {string} moduleName
* 			Optional name of a module to create the data for. 
*/
appRADInfo.prototype.newData = function (moduleName) {
	
	if ('undefined' == typeof moduleName) moduleName = this.moduleName;
	
	var infoPath = this.pathFromModule(moduleName);
	var iconPath = this.pathModuleIcon(moduleName); 
	
	var moduleInfo = {
			module: moduleName,
			name: moduleName,
			pathInfo: infoPath,
			iconPath: iconPath,
			labels:{
				installed:{}
			},
			sqlTables:{}
	}
	
	// store this in our Cache:
	cache[infoPath] = moduleInfo;
	
	this._data = moduleInfo;
	
	return moduleInfo;
}



// return the path to the .appRAD.info file for the given module
appRADInfo.prototype.pathFromModule = function (moduleName) {
	
	return  __appdevPath + '/modules/'+moduleName+'/.appRAD.info';
}



// return the path to the individual module's icon
appRADInfo.prototype.pathModuleIcon = function (moduleName) {
	
	
	var iconPath = '/appRAD/portal/icon.jpg';  // default if not specified.
	
	// if an icon is provided, then use that one
	var moduleIconPath = __appdevPath + '/modules/' + moduleName + '/web/resources/images/icon_'+moduleName+'.jpg';
	
	if (fs.existsSync(moduleIconPath)) {
		iconPath = moduleIconPath;
	}
	
	return iconPath;
}



// creating data {} that should be sent to the templateTools.createTemplates for appRAD.info files
appRADInfo.prototype.templateData = function ( data ) {
	
	var tags = this.templateTags();

	tags.module = data.module;
	tags.appRADInfo = JSON.stringify(data, null, '\t').replace('"false"','false').replace('"true"','true');
    return tags;
}



//-----------------------------------------------------------------------------
appRADInfo.prototype.update = function ( data ) {
    // store the provided data as our .appRAD.info data
    
    var dfd = $.Deferred();
    
    // if we have been given data to update:
    if ('undefined' != typeof data) {

        var pathInfo = this.pathFromModule( this.moduleName);
        cache[pathInfo] = data;
        
        // get this from a template
        var templateData = this.templateData(data);
 
        var templateDone = templateTool.createTemplates(templateData);
        $.when(templateDone)
            .then(function(data){
                dfd.resolve(data);
            })
            .fail(function(err){
                dfd.reject(err);
            });
        
    } else {
        
        // nothing to do, so continue:
        dfd.resolve();
    }
    
    return dfd;
}



////
//// using the TemplateTools to create our file
////

// our Template Definition
var listTemplates = {
 '/modules/[appRADModule]/data/templates/server/appRAD.info':{
     data:'',
     destDir:'/modules/[module]/.appRAD.info',
     userManaged:false
 },

};


// Create our Template Tools object
var TemplateTools = require('./templateTools.js');
var templateTool = new TemplateTools({
    listTemplates:listTemplates,
});


// Asynchronously Load our templates when this object is loaded.
require('path');
var localdir = __dirname;
var modulebase = path.join(__appdevPath,'modules');
localdir = path.relative(modulebase, localdir);
var parts = localdir.split(path.sep);
var appRADModule = parts[0];

for (var ti in listTemplates) {
    
    var templatePath = __appdevPath+ti;
    templatePath = templatePath.replace('[appRADModule]', appRADModule);
    templateTool.loadTemplate(ti, templatePath, listTemplates);
}

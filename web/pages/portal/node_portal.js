/**
 * @class appRAD.client.pages
 * @parent appRAD.client
 * 
 * ##appRAD client pages
 * 
 * appRAD client pages
 */
//required to separate comment blocks for documentjs, please do not remove
var __filler;


//// Template Replace:
//   appRAD     : the name of this page's module: (lowercase)
//   portal  : the name of this page :  (lowercase)
//   Portal  : the name of this page :  (Uppercase)


////
//// Portal
////
//// This is the Page level definition for the Portal page.
////
//// An "page" is usually a new page displayed in the browser, 
//// requiring a full page load.  
////
//// An page is required to load:
////    listJavascripts :  all the javascript files required for this page
////    listCSS : any css files required for this page
////    pathTemplate: the path from the site root to the template file to 
////                  use to render the page content
////    templateData: an object representing all the data to use to render 
////                  the template for this page content



var portalPage = new AD.App.Interface({
    pathPage: __dirname,
/*
    pathModules: __dirname + '/containers',
    pathScripts: __dirname+'/scripts',
*/
    listWidgets: [ 
// AppRAD: WIDGET DEPENDENCY //    
                 ]
    });
module.exports = portalPage;   

////
//// View Routes
////

var app = portalPage.app;

/*
 * You can override the default setup routine by uncommenting this and 
 * making changes:
 * 
portalPage.setup = function(callback) 
{
    var $ = AD.jQuery;
    var dfd = $.Deferred();

    //// 
    //// Scan any sub containers to gather their routes
    ////
    var dfdContainers = portalPage.loadContainers();
    
    
    //// 
    //// Scan for any services and load them
    ////
    var dfdPages = portalPage.loadServices();
    
    
    // Scan for any .css files registered for this page
    portalPage.loadPageCSS();
    
    // Create our routes : page/css
    portalPage.createRoutes();

    ////
    //// Resolve the deferred when done
    ////
    $.when(dfdContainers, dfdPages).then(function() {
        callback && callback();
        dfd.resolve();
    });
    
    return dfd;
}

*/



/*
 
 // if You need to do additional additions to the data being passed to your portal.ejs view
 // you can do that here:
 

var step1 = function(req, res, next) {
	
	var guid = req.aRAD.viewer.viewer_globalUserID;
    

	// data being passed to your template should be stored in req.aRAD.response.templateData
	req.aRAD.response.templateData['token'] = guid;
	
	// they can be accessed in your template as <%- data.token %>

	next();
}

portalPage.pageStack = [step1];  // make sure this gets called after our page/unitViewer gets loaded:

 */

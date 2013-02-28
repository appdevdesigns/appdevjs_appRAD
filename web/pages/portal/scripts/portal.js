
/**
 * @class appRAD.client.pages.Portal.appRADPortalSetup
 * @parent appRAD.client.pages.Portal
 * 
 *  The setup script for the portal Page container. 
 *
 *  The job of this code is to perform all the setup steps on the existing
 *  HTML DOM items now.  Add Events, actions, etc... 
 *
 *  This file will be generated 1x by the RAD tool and then left alone.
 *  It is safe to put all your custom code here.
 */



//// Template Replace:
//   appRAD     : the name of this page's module: (lowercase)
//   portal  : the name of this page :  (lowercase)
//   Portal  : the name of this page :  (Uppercase)


(function() {


////[appRad] --  setup object definitions here:
var appRADPortalSetup = function (topic, data) {

    //// Setup our Main Module Tabs widget here:
    $('#myTab').tabs_module();
    
    //// Setup Your Page Data/ Operation Here
	$('#summary-block').module_info_widget();
	$('#moduleListWidget').module_list_widget();
	
	//// Install Tab
	$('#module-install').workarea_install();
	
	
	$('#modelListWidget').model_list_widget();
	$('#modelAddWidget').model_add_widget();
	
	
	//// Setup Work Area: Web UI
	$('#web-ui').workarea_webui();
	
	$('#server').workarea_server();
	
	$('#module-models').workarea_model();
	
	
	
	//// Setup Work Area: Labels
	$('#labelListWidget').labels_label_list_widget();
	$('#labels-translation-tool').labels_translation_list();
	
//// TODO: move this into a controller:
//$('#myTab a').click(function (e) {
//  e.preventDefault();
//  $(this).tab('show');
//});


/*
 		//// NOTE: all your business logic should be contained in separate Controllers (portal/scripts/*.js )
 		////       this file is simply to apply your controllers to the web page.  Keep it simple here.
 		
		//// Setup Your Page Data/ Operation Here
	    $('#ModuleWorkAreaPanel').module_work_area_panel();
	    $('#PageWorkAreaPanel').page_work_area_panel();
	    $('#ModelWorkAreaPanel').model_work_area_panel();
	    
	    
	    var listModules = appRAD.Modules.listManager({});
	    $('#listModules').module_list_widget({
	    	title:'[appRad.portal.titleModuleList]', // this is the multilingual label key
	        dataManager:listModules,
	        height:'250',
	        pageSize:5,
	        buttons:{
	        	add:true,
	//        	delete:true,
	//        	edit:true,
	        	refresh:true
	        }
	    
	    });
*/
	
	// unsubscribe me so this doesn't get called again ... 
	AD.Comm.Notification.unsubscribe(portalSubID);
} // end appRADPortalSetup()
var portalSubID = AD.Comm.Notification.subscribe('ad.appRAD.portal.setup',appRADPortalSetup);




$(document).ready(function () {

    //// Do you need to do something on document.ready() before the above
    //// appRADPortalSetup() script is called?


}); // end ready()

}) ();
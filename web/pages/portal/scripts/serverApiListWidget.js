/**
 *  Setup the Webui Script List Widget
 */

//steal('/appRAD/portal/view/webuiScriptListWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('serverApiListWidget', {
    
            
            init: function (el, options) {

                var self = this;
                
                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {};
                var options = $.extend(defaults, options);
                
                this.options = options;
                this.selectedModule = null;

                this.listServerApi = appRAD.ServerApi.listIterator();
                this.modelInstance = new appRAD.ServerApi();
                this.element.appdev_list_admin({
                    uid:this.options.uid,
                    title:'[apprad.portal.server.ServerApi]',
                    buttons:{add:true},
                    dataManager:this.listServerApi,
                    modelInstance:this.modelInstance,
                    onAdd:function(event) {self.onAdd(event);},
                    onSelect:function(event, script) {  self.onSelect(event, script); },
                    templateEdit:'<input data-bind="serverapi" type="text" class="span12 option-input" placeholder="[apprad.portal.server.api.add.name]">'
                });
                this.serverapiList = this.element.data('appdev_list_admin');
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            onAdd: function(event){
            	var data = {
            		module: this.selectedModule
            	};
            	AD.Comm.Notification.publish('appRad.portal.server.api.add',this.modelInstance);
            },
            
            
            
            onSelect: function(event, serverapi) {
                var data = {
                	module: this.selectedModule,
                	filename: serverapi.name,
                	resource: serverapi.resource,
                	action: serverapi.action
                };
                this.modelInstance.attr('module', this.selectedModule);
                AD.Comm.Notification.publish('appRad.portal.server.api.selected', serverapi);

            },

            refreshData:function(data){
               //if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;
                    
                    this.serverapiList.clearList();
                    this.listServerApi.findAll({module:this.selectedModule});
                    
                    this.modelInstance.attr('module', this.selectedModule);

                //}
            },
            
            'appRad.portal.server.api.added subscribe': function(msg, data){
            	this.refreshData(data);
            },
            
            'appRad.module.selected subscribe': function(msg, data) {
                this.refreshData(data);
		  }
        });
        
    }) ();

// });  // end steal

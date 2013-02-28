/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/webuiLabelForm.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('serverAddServiceForm', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                    uid:'serverAddServiceForm',
                    onDelete:null              
                };
                var options = $.extend(defaults, options);
                this._super(el, options);
                
                this.options = options;
                var self = this;
                
                this.selectedModule = null;
                this.addForm = null;
                
                //// insert our DOM elements
                this.insertDOM();
         
                this.busyOff();
                             

                // Attach an ADForm to the Form entry and run it with PageLabel
                this.model = new appRAD.ServerApi(); // need a model instance for create/update ops.
                this.addForm.ad_form({
                    dataManager:this.model,
                    dataValid:function(data){ return self.isValid(data);},
                    error:'.text-error',
                    submit:'#btn-save',
                    cancel:'#btn-cancel',
                    onSubmit:function(model) {
                    	self.onSubmit(model);
                    },
                    onCancel:function() {
                        
                        self.ADForm.clear();
                        self.element.hide();
                        
                        return false; 
                    }
                });
                
                this.ADForm = this.addForm.data('ADForm');

                this.element.hide();
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            busyOn: function() {
                
                this.busyIndicator.show();
            },
            
            busyOff: function() {
                
                this.busyIndicator.hide();
            },
            
            onSubmit:function(model){
            	self = this;
            	if (model.url == ''){
//            		model.url = model.resource;
            	}
            	serverAPI = new appRAD.ServerApi({
            		module: this.selectedModule,
            		resource:model.resource,
            		action:model.action,
            		url:model.url
            	});
            	
            	serverAPI.save(function(data){
            		model.clear();
                    self.ADForm.clear();
                    self.element.hide();
                    AD.Comm.Notification.publish('appRad.portal.server.api.added',{name:this.module});
            	});
            },
            
            isValid:function(data) {
                
                var isValid = true;
                
                var listNotEmpty = ['server_resource', 'server_url', 'server_action'];
                
                for(var i=0; i<listNotEmpty.length; i++) {
                    var field = listNotEmpty[i];
                    if (data[field] == '') {
                        isValid = false;
                        var labelKey = '[appRad.portal.error.Required]';
                        this.ADForm.validationErrorField(field,labelKey);
                    }
                }

                return isValid;
            },

            insertDOM: function() {
                var self = this;
                
                this.element.html(this.view('/appRAD/portal/view/serverAddServiceForm.ejs', {}));

                // little spinner in title bar
                this.busyIndicator = this.element.find('.add-delete .busyicon-inline');
                
                // the add form
                this.addForm = this.element.find('#labels-form');
                
                
            }, 
            
            refreshData: function(msg,model){
                
                this.selectedModule = model.module;
                this.ADForm.setModel(model);
                this.element.show();
                
            },
            
            'appRad.portal.server.api.selected subscribe': function(msg, data){
            	this.refreshData(msg,data);
            },
            
            'appRad.portal.server.api.add subscribe': function(msg, data) {
                this.refreshData(msg,data);
            }
        });
        
    }) ();

// });  // end steal

/**
 *  Setup the Model Service Form
 */

//steal('/appRAD/portal/view/modelServiceForm').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('modelServiceForm', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
/*                      
                      gid:'modelAddWidget_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/
                };
                var options = $.extend(defaults, options);
                this._super(el, options);
                
                
                this.options = options;
                this.selectedModule = null;
                this.addForm = null;
                var self = this;
                
                // insert our DOM elements
                this.insertDOM();
                
                // attach other widgets & functionality here:
                this.model = new appRAD.ModelService(); // need a model instance for create/update ops.
                this.addForm.ad_form({
                    dataManager:this.model,
                    dataValid:function(data){ return self.isValid(data);},
                    submit:'#btn-save',
                    cancel:'#btn-cancel',
                    onSubmit:function(model) {
                    	return self.onSubmit(model);
                    },
                    onCancel:function() {
                        
                        self.ADForm.clear();
                        AD.Comm.Notification.publish('appRad.model.add.cancel');
                        
                        return false; 
                    }
                });
                
                this.ADForm = this.addForm.data('ADForm');
                
                this.ADForm.bind('saveDone',function(){
                	self.model.clear();
                	self.ADForm.clear();
                	AD.Comm.Notification.publish('appRad.model.created',self);
                });
                
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

            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/modelServiceForm.ejs', {}));
                
                // little spinner in title bar
                this.busyIndicator = this.element.find('.add-delete .busyicon-inline');
                
                // the add form
                this.addForm = this.element.find('#labels-form');
                
            },
            
            isValid:function(data) {
                
                var isValid = true;
                var noService = true;
                
                var listNotEmpty = ['resourceName', 'labelKey', 'primaryKey'];
                
                for(var i=0; i<listNotEmpty.length; i++) {
                    var field = listNotEmpty[i];
                    if (data[field] == '') {
                        isValid = false;
                        var labelKey = '[appRad.portal.error.Required]';
                        this.ADForm.validationErrorField(field,labelKey);
                    }
                }
                
                var servicesNotEmpty = ['publicLinks_create', 'publicLinks_update', 'publicLinks_destroy','publicLinks_findAll','publicLinks_findOne'];

                for(var i=0;i<servicesNotEmpty.length;i++){
                	var field = servicesNotEmpty[i];
                	if (data[field] == true){
                		noService = false;
                	}
                }
                
                if (noService){
                	isValid = false;
                    var labelKey = '[appRad.portal.error.RequiredOne]';
                    for(var i=0;i<servicesNotEmpty.length;i++){
                    	var field = servicesNotEmpty[i];
                    	this.ADForm.validationErrorField(field,labelKey);
                    }
                }

                return isValid;
            },
            
            onSubmit:function(model){
            	var self = this;
            	var publicLinks = [];
            	if (model.publicLinks_findAll){
            		publicLinks.push('findAll');
            	}
            	if (model.publicLinks_findOne){
            		publicLinks.push('findOne');
            	}
            	if (model.publicLinks_create){
            		publicLinks.push('create');
            	}
            	if (model.publicLinks_update){
            		publicLinks.push('update');
            	}
            	if (model.publicLinks_destroy){
            		publicLinks.push('destroy');
            	}
            	modelService = new appRAD.ModelService({
            		module: self.selectedModule,
            		resourceName:model.resourceName,
            		labelKey:model.labelKey,
            		primaryKey:model.primaryKey,
            		publicLinks:publicLinks
            	});
            	
            	self.ADForm.setModel(modelService);
            	
            	return true;
            },
            
            'appRad.module.selected subscribe': function(msg, data) {
                
                if (this.selectedModule != data.name) {
                    // track the latest module that is selected.
                    this.selectedModule = data.name;
                }
            }

        });
        
    }) ();

// });  // end steal

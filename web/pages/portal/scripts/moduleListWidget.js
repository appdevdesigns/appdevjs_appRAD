/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/moduleListWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('moduleListWidget', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
 /*                     gid:'moduleListWidget_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/
                };
                var options = $.extend(defaults, options);
 //               this._super(el, options);
                
                this.selected = null;
                this.addInProcess = false;
                
                this.options = options;
                
                
                // insert our DOM elements
                this.insertDOM();
                
                
                var _self = this;
                this.listModules =  appRAD.Modules.listIterator({});
                
                // attach other widgets & functionality here:
                this.$carousel = this.element.find('#myCarousel').appdev_list_carousel({
                	dataManager:this.listModules,
                	onSelection:function (el){ 
                		_self.onSelection(el);
                		},
                		
                	// onElement: is a provided callback to generate the individual contents of the carousel
                	onElement:function(rowMgr){
                		return '<img src="'+(rowMgr.iconPath || '/appRAD/portal/images/icon_application.png')+'" width="75" height="75" alt="">'+
        				'<div class="module-name"><h5>'+rowMgr.getLabel()+ '</h5></div>';
                	},
                	
                	// template: is an ejs template (using '[' tags) where 'this' refers to the individual Model obj 
 //               	template:'<img src="[%== this.iconPath || "/theme/default/images/icon.jpg" %]" width="75" height="75" alt="">'+
 //   				'<div class="module-name"><h5>[%= this.getLabel() %]</h5></div>'
                });
                // iconPath: /theme/default/images/icon.jpg
                
                
                this.element.find('#btn-addmodule').click(function() {_self.showAddForm(); });
                
                // find the Add Form
                this.initAddForm();
                
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            addFormClear: function() {
                this.$addForm_inputName.val('');
                this.$addFormError.html('');
            },
            
            
            
            addFormDisable: function() {
                this.$addForm_submit.addClass('disabled');
                this.$addForm_cancel.addClass('disabled');
                this.addInProcess = true;
            },
            
            
            
            addFormEnable: function() {
                this.$addForm_submit.removeClass('disabled');
                this.$addForm_cancel.removeClass('disabled');
                this.addInProcess = false;
            },
            
            
            
            addFormErrorMessage: function( err ) {
                var errMsg = AppDev.Comm.Error.message(err);
                this.$addFormError.html(errMsg).show();
            },
            
            
            
            addModule: function() {
              
                var _self = this;
                
                // get the module name
                var name = this.$addForm_inputName.val();

                appRAD.Modules.create({name:name}, function(data) {
                    
                    // refresh items in list
                    var refreshDone = _self.listModules.refresh();
                    $.when(refreshDone).then(function(){
                        
                    
                        // Select newly created module
                        _self.element.find('li').each(function(indx, el){
                           
                            var $el = $(el);
                            var currName = $el.find('.module-name h5').html();
                            
                            if (name == currName) {
                                _self.onSelection({currentTarget:el});
                            }
                        });
                        
                    
                    });
///// TODO: Need to make sure list scrolls so newly selected one is in view!
///// Waiting for Philippine Team to rework HTML and css so that modern version of jcarousel will display correctly!
///// until then, we won't do auto scrolling ... 
                    
                    _self.$addForm.hide();
                    _self.addFormEnable();
                    _self.addFormClear();
                    _self.busyOff();
                    
                }, function(err) {
                    
                    _self.busyOff();
                    _self.addFormEnable();
                    _self.addFormErrorMessage( err );
                    
                });
            },
            
            
            
            busyOff: function(){
                this.$addBusy.hide();
            },
            
            
            
            busyOn: function(){
                this.$addBusy.show();
            },
            
            
            
            initAddForm: function() {
            	var _self = this;
            	this.$addForm = this.element.find('.add-option');
            	
            	this.$addForm.ad_form({
            	    submit:'.option-submit', 
            	    cancel:'.option-cancel',
            	    onCancel:function() {
            	        _self.$addForm.hide();
                        _self.addFormClear();
                        _self.busyOff();
            	    }
            	});
            	
            	
            	this.$addForm_inputName = this.$addForm.find('#module-addform-name');
            	
            	// error message
            	this.$addFormError = this.$addForm.find('#error-AddModule');
            	this.$addFormError.html('').hide();
            	
            	this.$addBusy = this.$addForm.find('#addBusy');
            	this.busyOff();

            	// cancel button
            	this.$addForm_cancel = this.$addForm.find('#btn-addCancel');
            	this.$addForm_cancel.click(function() {
            	    if (!this.addInProcess) {
            	        _self.$addForm.hide();
            	        _self.addFormClear();
 //                       _self.$addForm.find('#module-addform-name').val('');
                        _self.busyOff();
            	    }
            	});
            	
            	
            	// submit button
            	this.$addForm_submit = this.$addForm.find('#btn-addSubmit');
            	this.$addForm_submit.click(function() {
            	    if (!this.addInProcess) {
            	        _self.busyOn();
                        _self.addFormDisable();
                        _self.addModule(); 
            	    }
            	});
            	
            },
            

            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/moduleListWidget.ejs', {}));
                
            },
            
            
            
            onSelection: function(el) {

            	// remove existing selected item marker
            	if (this.selected != null) {
                    this.selected.removeClass('active');
            		var div = this.selected.find('.module-active');
            		div.remove();
            	}
            	
            	// show new existing selected item marker
            	this.selected = $(el.currentTarget);
                this.selected.addClass('active');
            	var selectedDiv = $('<div class="module-active"></div>');
            	selectedDiv.css('width', this.selected.css('width'));
            	this.selected.prepend(selectedDiv);
            	
            	// send event: module.selected
            	var model = this.selected.data('adModel');
            	AD.Comm.Notification.publish('appRad.module.selected', model);
            },
            
            
            
            showAddForm: function() {
            	this.$addForm.show();
            	this.$addForm.focus();
            }
            
        });
        
    }) ();

// });  // end steal

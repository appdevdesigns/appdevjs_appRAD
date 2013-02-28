/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/modelAddWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('modelAddWidget', {
    
            
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
 //               this._super(el, options);
                
                
                this.options = options;
                this.selectedModule = null;
                
                
                // insert our DOM elements
                this.insertDOM();
                
                
                //this.attachAddSQLTable();
                
                // attach other widgets & functionality here:
                this.element.find('#modelSQLAddForm').model_sql_form();
                this.element.find('#modelSQLMultilingualAddForm').model_sql_multilingual_form();
                this.element.find('#modelServiceAddForm').model_service_form();
                
                this.element.hide();
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },

            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/modelAddWidget.ejs', {}));
                
            },

            
            //-----------------------------------------------------------------
            currentTargetWidget:function() {
                // on page load, the first time selecting a tab
                // should result in the model list being focused:
                
                var uid ='model-list-widget';
                
                
                // however, once a page is selected in the pageList
                // we really want the focus to drop directly to the 
                // form on the tab:
                if (this.modelItemSelected) {
                    
                    // which tab was selected?
                    switch(this.selectedTab) {
                        case '#addModel-SQL':
     //                       uid='';
                            break;
                        case '#addModel-Service':
     //                       uid = '';
                            break;
                        case '#addModel-FS':
                            break;
                        case '#addModel-CAS':
                        	break;
                        case '#addModel-OAuth':
                        	break;
                    }
                }
                
                
                // set the keyboard focus ==  uid
                if (this.element.is(':visible')) this.setKeyboardFocus(uid);
                return uid;
            },


            
            //-----------------------------------------------------------------
            showTabTitle: function(key) {
                // Make sure the proper tab title is displayed 
                
                var titleClass = 'h4.'+key.replace('#','');
                
                this.$titles.hide();
                this.element.find(titleClass).show();

            },
            

            
            //-----------------------------------------------------------------
            tabSetup: function() {
                // apply the appdev_tabs() widget to our element 
                
                var self = this;
                
                // attach our tab widget
                $(this.element).appdev_tabs({
                    ul:'ul.nav-tabs',
                    div:'.do',
                    onSelect:function(id) { self.onSelectTab(id); }
                });
                          
            },
            
            
            
            //-----------------------------------------------------------------
            titleSetup: function() {
                // find our titles 
                
                this.$titles = this.element.find('h4.tab-title');
                this.$titles.hide();
                this.$titles.find(':first').show();
                
            },
            
            
            
            //-----------------------------------------------------------------
            onSelectTab: function(tabID) {
                // each time a tab is selected, do the following:
                
                // 1) show the proper Section Title for this tab
                this.showTabTitle(tabID);
                
                this.selectedTab = tabID;

                this.currentTargetWidget();

            },
            
            //-----------------------------------------------------------------
            'appRad.model.add subscribe': function(message, data) {
                // each time a page is selected, we want to pass keyboard control to the proper widget:
                this.element.show();
            	
                this.modelItemSelected = true;
                
                this.currentTargetWidget();
               
            },
            
            //-----------------------------------------------------------------
            'appRad.model.add.cancel subscribe': function(message, data) {
                // each time a page is selected, we want to pass keyboard control to the proper widget:
                this.element.hide();
               
            },
            
            //-----------------------------------------------------------------
            'appRad.model.created subscribe': function(message, data) {
                // each time a page is selected, we want to pass keyboard control to the proper widget:
                this.element.hide();
               
            }

        });
        
    }) ();

// });  // end steal

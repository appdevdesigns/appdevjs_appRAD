/**
 *  Setup the Workarea Server Widget
 */

//steal('/appRAD/portal/view/workareaServer.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('workareaServer', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {

                };
                var options = $.extend(defaults, options);
                this._super(el, options);
                
                
                this.options = options;
                var self = this;
                this.serverItemSelected = false;
                
                // setup title
                this.titleSetup();
                
                // setup tabs
                this.tabSetup();  // NOTE: keep after titleSetup();
                
                //// attach other widgets & functionality here:
                //Server API Tab
                this.element.find('#serverApiListWidget').server_api_list_widget();
                this.element.find('#addServiceForm').server_add_service_form();
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            //-----------------------------------------------------------------
            currentTargetWidget:function() {
                // on page load, the first time selecting a tab
                // should result in the page list being focused:
                
                var uid ='webui-server-list';
                
                
                // however, once a page is selected in the pageList
                // we really want the focus to drop directly to the 
                // form on the tab:
                if (this.serverItemSelected) {
                    
                    // which tab was selected?
                    switch(this.selectedTab) {
                        case '#server-tab-api':
     //                       uid='';
                            break;
                        case '#server-tab-model-urls':
     //                       uid = '';
                            break;
                        case '#server-tab-module-api':
                            break;
                        case '#server-tab-generic':
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
            'appRad.webui.server.servers.selected subscribe': function(message, data) {
                // each time a page is selected, we want to pass keyboard control to the proper widget:
                
                this.serverItemSelected = true;
                
                this.currentTargetWidget();
               
            }
            
        });
        
    }) ();

// });  // end steal

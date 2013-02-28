/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/workareaWebui.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('workareaWebui', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {

                };
                var options = $.extend(defaults, options);
                this._super(el, options);
                
                
                this.options = options;
                var self = this;
                this.pageItemSelected = false;
                

                //// attach other widgets & functionality here:
                
                // setup title
                this.titleSetup();
                
                // setup tabs
                this.tabSetup();  // NOTE: keep after titleSetup();
                     
                this.element.find('#pageListWidget').webui_page_list_widget({uid:'webui-page-list'});
                
                
                // Page Tab
                this.element.find('#controllerListWidget').webui_list_widget();
                this.element.find('#viewListWidget').webui_view_list_widget();
                this.element.find('#editorWidget').webui_editor_widget();
                
                
                // Widget Tab
                

                // Label Tab
                this.element.find('#webuiLabelForm').webui_label_form({uid:'webui-label-form'});

                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            //-----------------------------------------------------------------
            currentTargetWidget:function() {
                // on page load, the first time selecting a tab
                // should result in the page list being focused:
                
                var uid ='webui-page-list';
                
                
                // however, once a page is selected in the pageList
                // we really want the focus to drop directly to the 
                // form on the tab:
                if (this.pageItemSelected) {
                    
                    // which tab was selected?
                    switch(this.selectedTab) {
                        case '#webui-tab-pages':
     //                       uid='';
                            break;
                        case '#webui-tab-widgets':
     //                       uid = '';
                            break;
                        case '#webui-tab-labels':
                            uid = 'webui-label-form';
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
            'appRad.webui.pages.page.selected subscribe': function(message, data) {
                // each time a page is selected, we want to pass keyboard control to the proper widget:
                
                this.pageItemSelected = true;
                
                this.currentTargetWidget();
               
            }
            
        });
        
    }) ();

// });  // end steal

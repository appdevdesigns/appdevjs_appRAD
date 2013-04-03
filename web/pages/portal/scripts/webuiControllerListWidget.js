/**
 *  Setup the Controller List Widget
 */
    // Keep all variables and functions inside an encapsulated scope
    (function() {


        //// Setup Widget:
        AD.Controller.extend('webuiControllerListWidget', {


            init: function (el, options) {

                var self = this;

                this.selectedPage = null;
                this.selectedModule = null;

//                this.listControllers = appRAD.Controllers.listIterator({module:this.selectedModule,page:this.selectedPage});
                this.listControllers = appRAD.Controllers.listIterator();
                this.modelInstance = new appRAD.Controllers();
                this.element.appdev_list_admin({
                	title:'[apprad.portal.webui.controllers]',
                	buttons:{add:true},
                	dataManager: this.listControllers,
                	modelInstance: this.modelInstance,
                	onSelect: function (event,controller){ self.onSelect(event,controller);},
                	templateEdit:'<input data-bind="controller" type="text" class="span12 option-input" placeholder="[apprad.portal.webui.controllers.add.name]">'
                });
                this.controllerList = this.element.data('appdev_list_admin');

                this.element.bind('addDone',function(ev, model){
                	self.controllerList.clearList();
                	self.listControllers.findAll({module:self.selectedModule,page:self.selectedPage});
                	data = {
                		module: self.selectedModule,
                		page: self.selectedPage
                	};
                	AD.Comm.Notification.publish('appRad.webui.pages.controller.added',data);
                });
            },
            onSelect:function(event,controller){
                data = {
                    module:this.selectedModule,
                    page:this.selectedPage,
                    file:controller.name
                };
                AD.Comm.Notification.publish('appRad.webui.pages.controller.selected',data);
            },
            'appRad.module.selected subscribe': function(msg, data) {

                // a new module is selected, so clear our present list until a page is selected
                this.controllerList.clearList();

            },
            'appRad.webui.pages.page.selected subscribe':function(message,data){
            	this.selectedPage = data.page;
            	this.selectedModule = data.module;
            	this.controllerList.clearList();
            	this.listControllers.findAll({module: this.selectedModule,page:this.selectedPage});
            	this.modelInstance.attr('page',this.selectedPage);
            	this.modelInstance.attr('module',this.selectedModule);
            },
            'appRad.module.selected subscribe': function(msg, data) {

                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;

                    this.controllerList.clearList();
                }
            }

        });

    }) ();

// });  // end steal

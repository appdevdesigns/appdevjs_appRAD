(function(){
	AD.Controller.extend('webuiViewListWidget',{
		
		init:function(el,options){
			
			var self = this;
			this.selectedController = null;
			this.selectedPage = null;
			this.selectedModule = null;
			
			// Initially we don't have a page/module to lookup, so don't make 
			// a web service call
			this.listViews = appRAD.Views.listIterator();
			this.modelInstance = new appRAD.Views();
			
			this.element.appdev_list_admin({
				title: '[apprad.portal.webui.views]',
				buttons: {add:true},
				dataManager: this.listViews,
				modelInstance: this.modelInstance,
				onSelect:function(event,view){self.onSelect(event,view);},
				templateEdit:'<input data-bind="view" type="text" class="span12 option-input" placeholder="[apprad.portal.webui.views.add.name]">'
			});
			this.element.bind('addDone',function(ev,model){
				self.viewList.clearList();
				self.listViews.findAll({module:self.selectedModule,page:self.selectedPage});
			});
			this.viewList = this.element.data('appdev_list_admin');
		},
		'appRad.webui.pages.page.selected subscribe':function(message,data){
			this.refreshData(message,data);
		},
		
		'appRad.webui.pages.controller.added subscribe':function(message,data){
			this.refreshData(message,data);
		},
		
		refreshData:function(message,data){
			this.selectedPage = data.page;
        	this.selectedModule = data.module;
			this.viewList.clearList();
			this.listViews.findAll({module:this.selectedModule,page:this.selectedPage});
			this.modelInstance.attr('page',this.selectedPage);
			this.modelInstance.attr('module',this.selectedModule);
		},
		onSelect:function(event,view){
			data = {
            		module:this.selectedModule,
            		page:this.selectedPage,
            		file:view.name
            	};
			AD.Comm.Notification.publish('appRad.webui.pages.view.selected',data);
		},
        'appRad.module.selected subscribe': function(msg, data) {

            if (this.selectedModule != data.name) {
                this.selectedModule = data.name;

                this.viewList.clearList();
            }
        }

	});
})();
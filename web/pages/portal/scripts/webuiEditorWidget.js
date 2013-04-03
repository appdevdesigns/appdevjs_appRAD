/**
 *  Setup the Code Mirror Widget
 */
    (function() {
        //// Setup Widget:
        AD.Controller.extend('webuiEditorWidget', {
    
            
            init: function (el, data) {
            	
            	var self = this;
            	this.selectedModule = null;
            	this.selectedPage = null;
            	this.selectedFile = null;
            	
            	this.listFile = new appRAD.File();
                this.element.appdev_codemirror({
                	title: '[apprad.portal.webui.title.editor.controller]',
            		modelInstance: this.listFile,
            		onSubmit: function(editor){ self.onSubmit(editor);}
                });
            },
            displayFile:function(data){
            	var self = this;
            	this.selectedModule = data.module;
            	this.selectedPage = data.page;
            	this.selectedFile = data.file;
            	appRAD.File.findOne({module:this.selectedModule,page:this.selectedPage,file:this.selectedFile},function(data){
                	self.element.appdev_codemirror('setModel',data);
            	});
            },
            'appRad.webui.pages.controller.selected subscribe':function(message,data){
            	this.displayFile(data);
            },
            'appRad.webui.pages.view.selected subscribe':function(message,data){
            	this.displayFile(data);
            },
            onSubmit:function(editor){
            	appRAD.File.update({id:editor.id,file:editor.id,module:this.selectedModule,page:this.selectedPage,content:editor.fileContent},function(data){
            		alert('File: '+self.selectedFile+' saved successfully.');
            	});
            }
        }); 
    }) ();

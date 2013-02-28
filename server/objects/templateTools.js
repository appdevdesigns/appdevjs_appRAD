////
//// RadTools
////
//// This object provides common routines that are shared among our
//// Services.
//// 
//// 

var $ = AD.jQuery;


function RadTools( opt ) {

    this.listDirectories = {};

    this.numTemplates = 0;
    this.listTemplates = {};
    
    
    // load in all the passed in parameters
    for(var i in opt) {
        this[i] = opt[i];
    }
    
    
    // count the num of templates provided
    for( var ti in this.listTemplates) {
        this.numTemplates ++;
    }
    
};
module.exports = RadTools;






////---------------------------------------------------------------------
RadTools.prototype.createDirectory = function (values) {
    // Create the directories.
    //
    // the req object needs to already have req.appRAD.listTags defined.
    // these values will be used to replace the embedded tags in the 
    // directory information.
    var dfd = $.Deferred();
    
    var listDirectories = this.listDirectories;
    
    var arrayDirectories = [];
    
//    AD.Util.Log('  - createDirectory: ');

    for (var dir in listDirectories) {
    
        var destDir = __appdevPath + dir;
        
        // foreach values
        for (var tagi in values) {
            
            // replace tag with value
            // embedded tag is "[tagi]" 
            var tag = new RegExp("\\["+tagi+"\\]", "g")
            destDir = destDir.replace(tag, values[tagi]);
            
        } // next tag
            
        arrayDirectories.push( destDir );
        
    }
    
    this.recursiveDirectoryCheck(0, arrayDirectories, dfd);
    
    return dfd;
}




////---------------------------------------------------------------------
RadTools.prototype.createTemplates = function (values) {
    // Create any initial template files necessary for this operation.
    
    var dfd = $.Deferred();

    var listTemplates = this.listTemplates; 
    var numTemplates = 0; // this.numTemplates;

     // mark the number of templates written (0 so far)
    var numWritten = 0;
    
    // foreach Template
    for (var ti in listTemplates) {
    
        // get template for Model Base
        var template = listTemplates[ti].data;
        
//        console.log('template = '+template);

//        var destDir = __appdevPath + listTemplates[ti].destDir; // listDestinations[ti];
        var listDestDirs = listTemplates[ti].destDir;
        
        if ('string' == typeof listDestDirs) listDestDirs = [listDestDirs];
        if ('undefined' == typeof listDestDirs.length) listDestDirs = [listDestDirs];  // this should catch objects
        numTemplates += listDestDirs.length;
        
        // foreach destDir
        for (var dd=0; dd< listDestDirs.length; dd++ ) {
            
            var destDir = __appdevPath + listDestDirs[dd];
            
            // foreach template tag
            for (var tagi in values) {
            
                // replace tag with value
                // embedded tag is "[tagi]" 
                var tag = new RegExp("\\["+tagi+"\\]", "g")
                template = template.replace(tag, values[tagi]);
                destDir = destDir.replace(tag, values[tagi]);
                
            } // next tag
            
            
            var writeIt = function(destDir, template) {

                // store template data into proper directory
                fs.writeFile( destDir, template, 'utf8', function(err) { 
                
                    if (err) {
                    
                        AD.Util.Log( '   error['+err.message+']');
                        AD.Util.Log( '  ::: appRAD : Error in Module Create. Unable to write to ['+destDir+']');
                        dfd.reject(err);
//                        throw err;
                        
                    } else {
                    
                        // mark one of our templates written
                        numWritten ++;
                        
                        // if all our templates are written, then 
                        if (numWritten >= numTemplates) {
                        
                            dfd.resolve();
                        
                        }
                        
                    }
                
                });  // end file Write
            }
            writeIt(destDir, template);
            
            
        } // next Dest Dir
        
    } // next Model Template


    return dfd;
}




////---------------------------------------------------------------------
RadTools.prototype.loadTemplate = function (key, path, list) {
    // load the given file from path and store it in list[key]
    
    fs.readFile( path, 'utf8', function (err, data) {
        if (err) throw err;
        list[key].data = data;
    });
}




////---------------------------------------------------------------------
RadTools.prototype.recursiveDirectoryCheck = function (index, listDirectories, dfd) {
    // recursively checks to make sure each of the listDirectories exist.
    // if they don't exist, they will be created.
    
    
    // if indx is beyond the number of listDirectories
    if (index >= listDirectories.length) {
        
        // we are done so call next()
        dfd.resolve();
        
    } else {
    
        var curDir = listDirectories[index];
        var self = this;
        
        // if currDir does not exist
        path.exists(curDir, function (exists) {
          
            if (!exists) {
          
                AD.Util.Log('    - creating Directory ['+ curDir +']');
                
                
                // create directory ( callback{
                fs.mkdir(curDir, '0775', function (err) {
                
                    if (err) {
                    
                        AD.Util.Log('  *** error creating directory ['+curDir+'] ***');
                        AD.Util.LogDump(err);
                        dfd.reject(err);
                    
                    } else {
                    
                        // directory made so move to the next one:
                        self.recursiveDirectoryCheck( index+1, listDirectories, dfd);
                    }
                });
                
            } else {
            
                AD.Util.Log('    - Directory already exists['+ curDir +']');
                self.recursiveDirectoryCheck( index+1, listDirectories, dfd);
            }
        });
        
    }    
    
}



////---------------------------------------------------------------------
RadTools.prototype.listFileNames = function (path, callback) {
    this.listFSEntries('files', path, callback);
}



////---------------------------------------------------------------------
RadTools.prototype.listDirNames = function (path, callback) {
    this.listFSEntries('directories', path, callback);
}



////---------------------------------------------------------------------
RadTools.prototype.listFSEntries = function (type, path, callback) {
    fs.readdir(path, function(err, files){
        
        // if err then
        var list = [];
        if (!err) {
            
            // Create the filter function that identifies appropriate items
            var listDirs = (type == 'directories');
            var verifyFile = function(item, filterCallback) {
                // skip those with a '.xxx'
                if (item.indexOf(".") == 0) {
                    filterCallback(false);
                    return;
                }
                fs.stat(path+'/'+item, function(err, stats) {
                    if(!err && (stats.isDirectory() == listDirs)){
                        var obj = { 
                            name:item,
                            id:item
                        };
                        list.push(obj);
                    }
                    filterCallback(false);
                });
            };
            
            async.forEach(files, verifyFile, function(err){
                // All done; return the list
                if (!err) {
                    list.sort();
                }
                callback(err, list);
            });
        }// end if
        else {
            // Return the error
            callback(err, list);
        }
        
    });
}



////---------------------------------------------------------------------
RadTools.prototype.fileRead = function (path, callback) {
    var myFd = null;
    // Call each of the filesystem functions in series.
    // Each passes the arguments to the next
    // If any experiences an error, the final callback will fire
    // Notice the overuse of the word 'callback'; don't get confused!
    async.waterfall([
        function(callback) {
            fs.open(path, 'r', callback);
        },
        function(fd, callback) {
            myFd = fd;
            fs.fstat(myFd, callback);
        },
        function(stats, callback) {
            var size = stats.size;
            if (size > 0) {
                var buffer = new Buffer(size);
                fs.read(myFd, buffer, 0, size, 0, callback);
            } else {
                callback(null, 0, null);
            }
        },
        function(bytes, buffer, callback) {
            var fileStr = '';
            if (bytes > 0) {
                fileStr = buffer.toString('utf8', 0, bytes);
            }
            fs.close(myFd);
            callback(null, fileStr);
        }
    ],
        // Final callback or landing place for errors
        function(err, result) {
            callback(err, result);
        }
    );
}



////---------------------------------------------------------------------
RadTools.prototype.fileWrite = function (path, content, callback) {
    var myFd = null;
    // Call each of the filesystem functions in series.
    // Each passes the arguments to the next
    // If any experiences an error, the final callback will fire
    // Notice the overuse of the word 'callback'; don't get confused!
    async.waterfall([
        function(callback) {
            fs.open(path, 'w', callback);
        },
        function(fd, callback) {
            myFd = fd;
            var fileStr = content;
            var buffer = new Buffer(fileStr, 'utf8');
            fs.write(myFd, buffer, 0, buffer.length, 0, callback);
        },
        function(bytes, buffer, callback) {
            var fileStr = buffer.toString('utf8', 0, bytes);
            fs.close(myFd);
            callback(null);
        }
    ],
        // Final callback or landing place for errors
        function(err) {
            callback(err);
        }
    );
}



////---------------------------------------------------------------------
RadTools.prototype.saveValues = function (req, values) {
    // store listTags in req.appRAD for TemplateTools.createTemplate() 
    // to use them.
	
    req.appRAD = {};
    req.appRAD.listTags = values;
}




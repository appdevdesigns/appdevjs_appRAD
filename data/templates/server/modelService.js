
/**
 * @class [moduleName].server.models.[ResourceName]
 * @parent [moduleName].server.models
 * 
 *  This is an object to manage the interaction with the [module].[ResourceName]s service.
 */


(function () {
	  var onServer = false;
	  if (typeof exports !== 'undefined') {
	  // exports are defined on the server side node modules
	      onServer = true;
	  } 
	  

	  if (!onServer) {

		  var attr = {
		      // Client Definitions
				_adModule:'[module]',
				_adResource:'[resourceName]',	// singular
//				_adModel: [ModelName]   // <-- if the data returned is associated with a diff Model obj, provide its name here:  _adModel:site.Label,
				labelKey:'[labelKey]',
				id:'[primaryKey]'  // the field that is the id of the data
		  };
		  
		  AD.Service.extend("[module].[ResourceName]",
    		  attr,
    		  {
    		  // define instance methods here.
    		  });
	  }
})()

////
//// appRAD.Controllers
////
//// This is an object to manage the interaction with the appRAD.Controllers service.


(function () {
	  var onServer = false;
	  if (typeof exports !== 'undefined') {
	  // exports are defined on the server side node modules
	      onServer = true;
	  } 
	  

	  if (!onServer) {

		  var attr = {
		      // Client Definitions
				_adModule:'appRAD',
				_adResource:'controller',	// singular
//				_adModel: [ModelName]   // <-- the data returned is not associated with any Model obj
				labelKey:'name',
				id:'id'  // the field that is the id of the data
		  };
		  
		  AD.Service.extend("appRAD.Controllers",
    		  attr,
    		  {
    		  // define instance methods here.
    		  });
	  }
})()

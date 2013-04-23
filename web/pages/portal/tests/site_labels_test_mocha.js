	 
	describe('site labels', function(){
		var labelId = 0;
		 before(function(done){
			var label = new site.Labels({
				language_code: 'en',
				label_key: '[testing.add.of.label]',
				label_label: 'Testing',
				label_lastMod: '2013-04-03 08:01:01',
				label_needs_translation: 0,
				label_path: '/page/site/adminToolbar' 
			});
			label.save(function(){
				var labelId = label.getID();
			});
			 done();
		 })
		 
		 it('site labels findAll', function(){
		    site.Labels.findAll({},function(list){
		    	chai.assert.deepEqual(list.length,346);
		  	});
		 })
	})

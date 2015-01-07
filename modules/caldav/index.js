module.exports={name:"caldav", "triggers":[
	{
		name:'event',
		fields:[
			{ name:'url', displayName:'Url'},
			{ name:'uid', displayName:'UID' }
		],
		when:function(fields, callback)
		{
			dates=ifttt.loadChannel('date.js');
			
		}
	}
], "actions":[]}
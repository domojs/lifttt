
var parent=global.ifttt||{};

module.exports={"name":"multi", "triggers":[
{"name":"L'un ou l'autre", fields:[{ "name":"triggers", "displayName":"Evenements"}], "delegate":function(fields){
	var result= function(){
		for(var i=0;i<fields['triggers'].length; i++)
		{
			var trigger=fields['triggers'][i];
			if(parent.loadChannel(trigger.path).find(trigger.name).delegate(trigger.params))
				return true;
		}
		return false;
	};
	result.fields=fields;
	return result;
}},
{"name":"L'un et l'autre", fields:[{ "name":"triggers", "displayName":"Evenements"}], "delegate":function(fields){
	var result= function(){
		for(var i=0;i<fields['triggers'].length; i++)
		{
			var trigger=fields['triggers'][i];
			if(!parent.loadChannel(trigger.path).find(trigger.name).delegate(trigger.params))
				return false;
		}
		return true;
	};
	result.fields=fields;
	return result;
}}
], "actions":[
{"name":"macro", fields:[{ "name":"actions", "displayName":"Evenements"}], "delegate":function(fields, trigger){
	var result= function(){
		for(var i=0;i<fields['actions'].length; i++)
		{
			var action=fields['actions'][i];
			var actionChannel=parent.loadChannel(action.path).find(action.name, 'action');
			if(!ifttt.that(actionChannel.delegate.call(actionChannel, action.params,trigger), action.params))
				return false;
		}
		return false;
	};
	result.fields=fields;
	return result;
}}
]};
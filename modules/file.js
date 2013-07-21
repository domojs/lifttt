var Client=$('../jabber.js').Client;

module.exports={name:"http", "trigger":[], "actions":[{name:"writeFile", fields:[{name:"name", displayName:"Nom"}, {name:"content", displayName:"contenu"}, {name:"encoding", displayName:"Encoding"}], delegate:function(params){
	return function(fields){
		$('fs').writeFile(params['name'], params['content'], fields['encoding']);
	};
}}]}
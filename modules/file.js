module.exports={name:"file", "triggers":[{
    name:"change",
    fields:[{name:"name", displayName:"Nom"}],
    when:function(fields,callback){
        $('fs').watchFile(fields.name, { persistent:false,interval:5007 },callback);
    }
}], "actions":[{name:"writeFile", fields:[{name:"name", displayName:"Nom"}, {name:"content", displayName:"contenu"}, {name:"encoding", displayName:"Encoding"}], delegate:function(params){
	return function(fields){
		$('fs').writeFile(params['name'], params['content'], fields['encoding']);
	};
}}]}
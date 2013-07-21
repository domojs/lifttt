module.exports={name:"console", "triggers":[{name:"on data",fields:[{name:"tty", displayName:"Which input should be watched"}], when:function(fields,callback){
	$('fs').createReadStream(fields.tty).on('data', function(data){
			callback({data:data})
		});
	}
}], "actions":[{name:"log on console", fields:[{ name:"message", displayName:"What's Happening ?"}], delegate:function(fields){
        var result= function(fields){
                console.log(fields.message);
        };
        result.fields=fields;
        return result;
}}]}
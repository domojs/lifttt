module.exports={name:"http", "trigger":{}, "actions":[{name:"get", fields:[{ name:"url", displayName:"URL"}], delegate:function(fields){
        var result= function(fields){
			try
			{
				var url=$('url').parse(fields.url);
				
				$('http').request({hostname:url.hostname, path:url.path, port:url.port, headers:{accept:'application/json'}}).on('clienterror', function(ex){ console.log(ex); }).on('error', function(ex){ console.log(ex); }).on('response', function(response){ }).end();
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}},
{name:"download", fields:[{ name:"url", displayName:"URL"},{name:"file", displayName:'Fichier'},{name:"userName", displayName:'Nom d\'utilisateur'},{name:"password", displayName:'Mot de passe'}], delegate:function(fields){
        var result= function(fields, trigger, completed){
			try
			{
                var options={error:function(ex){ console.log(ex); }};
                if(fields.userName)
                    $.extend(options, {auth:fields.userName+':'+fields.password});
				$.ajax(fields.url, options)
                    .on('response', function(response){ 
                        var output = $('fs').createWriteStream(fields.file);
                            response.pipe(output);
                        response.on('close', function(){
                            console.log('download complete');
                            completed();
                        });
                    })
                    .end();
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}}]}
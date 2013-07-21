module.exports={name:"http", "trigger":{}, "actions":[{name:"get", fields:[{ name:"url", displayName:"URL"}], delegate:function(fields){
        var result= function(fields){
			try
			{
				console.log(fields.url);
				var url=$('url').parse(fields.url);
				console.log(url);
				
				$('http').request({hostname:url.hostname, path:url.path, port:url.port, headers:{accept:'application/json'}}).on('clienterror', function(ex){ console.log(ex); }).on('error', function(ex){ console.log(ex); }).on('response', function(response){ }).end();
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}}]}
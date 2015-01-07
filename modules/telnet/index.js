module.exports={name:"telnet", "triggers":[], "actions":[{name:"run", fields:[{ name:"host", displayName:"Host"},{ name:"port", displayName:"Port"},{ name:"cmd", displayName:"Command"}], delegate:function(fields){
        var result= function(fields){
			try
			{
				var client=$('net').connect({port:fields.port, host:fields.host}, function(){
					client.write(fields.cmd);
					client.write('exit');
				})
			}
			catch (ex)
			{
				console.log(ex);
			}
        };
        result.fields=fields;
        return result;
}}]}
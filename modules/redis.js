var client=$('../modules/db/node_modules/redis').createClient(6379, 'ana.dragon-angel.fr');

module.exports={
    name:"redis", 
    "triggers":
    [
        {
            name:"message",
            fields:[{name:"channel", displayName:"The channel to subscribe to"}],
            when:function(fields,callback){
                client.on('message', function(channel, message){
                    callback({channel:channel, message:message});
                });
                
                client.subscribe(fields.channel);
                
                process.on('exit', function(){
                    client.unsubscribe();
                    client.end();
                });
            }
        }
    ],
    "actions":
    [
    ]
}; 
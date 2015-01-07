var Client=$('jabber').Client;

module.exports={
    name:"jabber", 
    "triggers":
    [
        {
            name:"motion-detected", 
            fields:
            [
                {name:"port", displayName:"Port"}, 
                {name:"host", displayName:"Hôte"}, 
                {name:"username", displayName:"user name"},
                {name:"password", displayName:"Mot de passe"}
            ],
            when:function(fields,callback){
                var client=new Client(fields.port, fields.host, fields.username, fields.password);
                client.on('motionDetected', function(base64Picture){ 
                    console.log(base64Picture);
                    callback({encoding:'base64',date:new Date(), picture:base64Picture});
                });
                process.on('exit', function(){
                    client.end();
                });
            }
        }
    ],
    "actions":[]
};
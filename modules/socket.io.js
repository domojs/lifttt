var io=$('socket.io-client')('http://localhost');

module.exports={name:"socket.io", "triggers":[{name:"on",fields:[{name:"eventName", displayName:"The name of the event to watch"}], when:function(fields,callback){
	io.on(fields.eventName, callback);
}], "actions":[
	{name:"emit", fields:[{name:"eventName", displayName:"the name of the event to trigger"}, {name:"data", displayName:"The data to transmit"}], delegate:function(fields){
		io.emit(fields.eventName, fields.data);
	}}
]}
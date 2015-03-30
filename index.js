require('../node_modules/jnode/setup.js');
process.preventNextOccurrences=[];
var channels={};
global.ifttt={};
function loadChannel(path)
{
	if(typeof(channels[path])=='undefined')
		channels[path] = $.extend(require('./modules/'+path), {find:function(name, type){
			type=type || 'trigger';
		console.log('loading '+type+' '+name);
		var result= find(this[type+'s'], name); 
		if(result && type=='trigger' && result.delegate)
		{
            var triggerChannel=this;
            result.when=function(fields, completed)
            {
                trigger=result.delegate.call(triggerChannel, recipe.trigger.params);
                var raiser=new OnceAMinuteEmitter();
                
                var precompleted=function(fields) 
                {
                    var index=process.preventNextOccurrences.indexOf(recipe.name);
                    if(index>-1)
                        process.preventNextOccurrences.splice(index,1);
                    else
                        that.call(action,fields,trigger, completed);
                };
                
                raiser.on('trigger', precompleted);
        
                var stop=false;
                process.on('preexit', function(){
                    stop=true;
                });
        
                (function loop()
                {
                    if(trigger.call(triggerChannel, raiser, precompleted))
                        raiser.emit('trigger', trigger.fields);
                
                    if(!stop)
                        setImmediate(loop);
                })();
            };
		}
		return result;
		}, register:register});
	return channels[path];
}

ifttt.loadChannel=loadChannel;
ifttt.that=function(action, fields, trigger, completed)
{
	that.call(action, fields, trigger, completed);
};

function find(list, name)
{
    list = $.grep(list, function(element){ 	
        return element.name==name; 
    });
    if(!list.length)
		return null;
	return list[0];
}

var context=this;

function that(fields, trigger, next)
{
	var params={};
	console.log(this.fields);
	$.each(this.fields, function(index, item){
		if(typeof(item)=='string')
			params[index]=$('router/formatter.js')(item)(fields);
	});
	return this(params, trigger, next);
}

var EventEmitter=$('events').EventEmitter;

var OnceAMinuteEmitter=function(){
	this.emit=function(){
		if(typeof(this.nextEmit)=='undefined')
		{
			this.nextEmit=new Date();
			this.nextEmit.setMinutes(this.nextEmit.getMinutes()+1);
			this.nextEmit.setSeconds(0);
		}
		if(new Date()>this.nextEmit)
		{
			EventEmitter.prototype.emit.apply(this, arguments);
			this.nextEmit.setMinutes(this.nextEmit.getMinutes()+1);
		}
	}
};
OnceAMinuteEmitter.prototype=EventEmitter.prototype;

function register(recipe){
	var triggerChannel=loadChannel(recipe.trigger.path);
	var actionChannel=loadChannel(recipe.action.path);
	var action=actionChannel.find(recipe.action.name, 'action').delegate.call(actionChannel, recipe.action.params);
		
    console.log(recipe.trigger.path);
    console.log(recipe.trigger.name);
	var trigger=find(triggerChannel.triggers, recipe.trigger.name);
	trigger.when.call(triggerChannel, recipe.trigger.params, function(fields, completed) 
    {
        var index=process.preventNextOccurrences.indexOf(recipe.name);
        if(index>-1)
            process.preventNextOccurrences.splice(index,1);
        else
            that.call(action,fields,trigger, completed);
    });
}

var recipes=require('./recipes.json');
$.each(recipes, function(){ if(!this.disabled) register(this); });
console.log('initialized');
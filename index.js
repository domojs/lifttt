require('domojs/node_modules/jnode/setup.js');
process.preventNextOccurrences=[];
var channels={};
global.ifttt={};
function loadChannel(path)
{
	if(typeof(channels[path])=='undefined')
		channels[path] = $.extend($('./modules/'+path), {find:function(name, type){
			type=type || 'trigger';
			console.log('loading '+type+' '+name);
		return find(this[type+'s'], name); }, register:register});
	return channels[path];
}

ifttt.loadChannel=loadChannel;
ifttt.that=function(action, fields, trigger, completed)
{
	that.call(action, fields, trigger, completed);
};

function find(list, name)
{
	list=$.grep(list, function(element){ 	
		return element.name==name; 
	});
	if(list.length==0)
		return null;
	return list[0];
}

var context=this;

function that(fields, trigger, next)
{
	var params={};
	console.log(this.fields);
	$.each(this.fields, function(index){
		if(typeof(index)=='string')
			params[index]=$('router/formatter.js')(this)(fields);
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
	var action=find(actionChannel.actions, recipe.action.name).delegate.call(actionChannel, recipe.action.params);
		
    console.log(recipe.trigger.path);
    console.log(recipe.trigger.name);
	var trigger=find(triggerChannel.triggers, recipe.trigger.name);
	if(trigger.delegate)
	{
		trigger=trigger.delegate.call(triggerChannel, recipe.trigger.params);
		var raiser=new OnceAMinuteEmitter();
	
		raiser.on('trigger', function(fields, completed) 
        {
            var index=process.preventNextOccurrences.indexOf(recipe.name);
            if(index>-1)
                process.preventNextOccurrences.splice(index,1);
            else
                that.call(action,fields,trigger, completed);
        });

        var stop=false;
        process.on('preexit', function(){
            stop=true;
        });

		(function loop()
		{
			if(trigger.call(triggerChannel, raiser))
				raiser.emit('trigger', trigger.fields);

            if(!stop)
			    setImmediate(loop);
		})();
	}
	else
		trigger.when.call(triggerChannel, recipe.trigger.params, function(fields, completed) 
        {
            var index=process.preventNextOccurrences.indexOf(recipe.name);
            if(index>-1)
                process.preventNextOccurrences.splice(index,1);
            else
                that.call(action,fields,trigger, completed);
        });

}

var recipes=$('./recipes.json');
$.each(recipes, function(){ if(!this.disabled) register(this); });
console.log('initialized');
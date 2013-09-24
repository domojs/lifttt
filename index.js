require('jnode/setup.js');

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
ifttt.that=function(action, fields, trigger)
{
	that.call(action, fields, trigger);
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

function that(fields, trigger)
{
	var params={};
	$.each(this.fields, function(index){
		if(typeof(index)=='string')
			params[index]=$('router/formatter.js')(this)(fields);
	});
	return this(params, trigger);
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
		
	var trigger=find(triggerChannel.triggers, recipe.trigger.name);
	if(trigger.delegate)
	{
		trigger=trigger.delegate.call(triggerChannel, recipe.trigger.params);
		var raiser=new OnceAMinuteEmitter();
	
		raiser.on('trigger', function(fields){ that.call(action, fields, trigger) });

		(function loop()
		{
			if(trigger.call(triggerChannel, raiser))
				raiser.emit('trigger', trigger.fields);

			setImmediate(loop);
		})();
	}
	else
		trigger.when.call(triggerChannel, recipe.trigger.params, function(fields) { that.call(action,fields,trigger); });

}

var recipes=$('./recipes.json');
$.each(recipes, function(){ register(this); });
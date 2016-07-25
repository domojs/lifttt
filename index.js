require('jnode/setup.js');
var debug=$('debug')('ifttt:core');
process.preventNextOccurrences=[];
var channels={};
global.ifttt={};
function loadChannel(path)
{
	if(typeof(channels[path])=='undefined')
		channels[path] = $.extend(require('./modules/'+path), {find:function(name, type){
			type=type || 'trigger';
		debug('loading '+type+' '+name);
		var result= find(this[type+'s'], name); 
		if(result && type=='trigger' && result.delegate)
		{
            var triggerChannel=this;
            result.when=function(fields, completed)
            {
                trigger=result.delegate.call(triggerChannel, fields, completed);
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
ifttt.mode='normal';
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
	var replace=function(obj, target)
	{
	    if(obj)
    	    $.each(obj, function(index, item){
        		if(typeof(item)=='string')
        			target[index]=$('router/formatter.js')(item)(fields);
        		else if(item instanceof Object)
        		    replace(item, target[index]={});
    	});
	};
	replace(this.fields, params)
	debug(params);
	
	return this(params, trigger, function(statusCode, e){
	    if(statusCode==500)
	        console.error(e);
        else if(next)
            next.apply(this, arguments);
	});
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
	var condition=false;
	if(recipe.condition)
	{
	    var conditionChannel=loadChannel(recipe.condition.path);
	    condition=conditionChannel.find(recipe.condition.name, 'condition').evaluate.call(conditionChannel, recipe.condition.params);
	}
		
    debug(recipe.trigger.path);
    debug(recipe.trigger.name);
    if(typeof(recipe.mode)=='undefined')
        recipe.mode='*';
    if(typeof(recipe.mode)=='string')
        recipe.mode=[recipe.mode];
        
	var trigger=find(triggerChannel.triggers, recipe.trigger.name);
	trigger.when.call(triggerChannel, recipe.trigger.params, function(fields, completed) 
    {
        var index=process.preventNextOccurrences.indexOf(recipe.name);
        debug(ifttt.mode);
        debug(recipe.mode);
        debug(condition);
        if(index>-1)
            process.preventNextOccurrences.splice(index,1);
        else if(!condition)
            that.call(action,fields,trigger, completed);
        else
        {
            debug('calling condition');
            debug(condition.toString());
            condition(fields, function(result){
                debug(result);
                if(result)
                    that.call(action,fields,trigger, completed);
            })
        }
    });
}

process.setMaxListeners(30);

var recipes=require('./recipes.json');
$.each(recipes, function(){ if(!this.disabled) register(this); });
debug('initialized');
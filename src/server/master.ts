import * as akala from '@akala/server';
import * as lifttt from './channel'
import { Connection } from '@akala/json-rpc-ws';

@akala.server(lifttt.channel, { jsonrpcws: 'lifttt', rest: '/api/@domojs/lifttt' })
class Channel
{
    constructor() { }

    private channels: { [name: string]: { connection: Connection, name: string } } = {};
    private triggers: { [name: string]: { connection: Connection, fields: lifttt.Field[], name: string } } = {};
    private actions: { [name: string]: { connection: Connection, fields: lifttt.Field[], name: string } } = {};
    private conditions: { [name: string]: { connection: Connection, fields: lifttt.Field[], name: string } } = {};
    private triggerMap: { [id: string]: Connection } = {};

    public async executeTrigger(param, connection)
    {
        var id = await akala.api.jsonrpcws(lifttt.channel).createClientProxy(this.triggers[param.name].connection).executeTrigger(param);
        this.triggerMap[id] = connection;
    }

    public executeAction(param)
    {
        return akala.api.jsonrpcws(lifttt.channel).createClientProxy(this.actions[param.name].connection).executeAction(param);
    }

    public executeCondition(param)
    {
        return akala.api.jsonrpcws(lifttt.channel).createClientProxy(this.conditions[param.name].connection).executeCondition(param);
    }

    public registerTrigger(param, connection)
    {
        if (param.name in this.triggers)
            throw new Error('a trigger named ' + param.name + ' already exists');
        this.triggers[param.name] = { connection: connection, fields: param.fields, name: param.name };
    }

    public registerAction(param, connection)
    {
        if (param.name in this.actions)
            throw new Error('an action named ' + param.name + ' already exists');
        this.actions[param.name] = { connection: connection, fields: param.fields, name: param.name };
    }

    public registerCondition(param, connection)
    {
        if (param.name in this.conditions)
            throw new Error('a condition named ' + param.name + ' already exists');
        this.conditions[param.name] = { connection: connection, fields: param.fields, name: param.name };
    }

    public registerChannel(param, connection)
    {
        this.channels[param.name] = { connection, name: param.name };
    }

    public async trigger(param)
    {
        await akala.api.jsonrpcws(lifttt.channel).createClientProxy(this.triggerMap[param.id]).executeTrigger(param);
        return;
    }

    public listChannels()
    {
        return Promise.resolve(akala.map(this.channels, function (channel)
        {
            return channel.name;
        }, true));
    }

    public listTriggers(param)
    {
        var channel = this.channels[param.channel];

        return Promise.resolve(akala.map(akala.grep(this.triggers, (trigger) => channel.connection === trigger.connection), (trigger) =>
        {
            return { name: trigger.name, fields: trigger.fields };
        }, true));
    }

    public listActions(param)
    {
        var channel = this.channels[param.channel];

        return Promise.resolve(akala.map(akala.grep(this.actions, (action) => channel.connection === action.connection), (action) =>
        {
            return { name: action.name, fields: action.fields };
        }, true));
    }

    public listConditions(param)
    {
        var channel = this.channels[param.channel];

        return Promise.resolve(akala.map(akala.grep(this.conditions, (condition) => channel.connection === condition.connection), (condition) =>
        {
            return { name: condition.name, fields: condition.fields };
        }, true));
    }
}
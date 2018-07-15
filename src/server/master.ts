import * as akala from '@akala/server';
import * as lifttt from './channel'
import { Connection } from '@akala/json-rpc-ws';
import { IconName } from '@fortawesome/fontawesome-common-types';

@akala.server(lifttt.channel, { jsonrpcws: '/lifttt', rest: '/api/@domojs/lifttt' })
class Channel
{
    constructor() { }

    private channels: {
        [name: string]: {
            connection: Connection,
            name: string,
            triggers?: lifttt.Programs,
            actions?: lifttt.Programs,
            conditions?: lifttt.Programs,
            icon: IconName,
            view: string,
            iconLibrary:string,
        }
    } = {};
    private triggers: lifttt.Programs<{ connection: Connection }> = {};
    private actions: lifttt.Programs<{ connection: Connection }> = {};
    private conditions: lifttt.Programs<{ connection: Connection }> = {};
    private triggerMap: { [id: string]: { connection: Connection, channel: string, trigger: string } } = {};

    public async executeTrigger(param, connection: Connection)
    {
        var connection: Connection;
        if (param.channel)
        {
            if (!this.channels[param.channel])
                throw new Error(`Channel ${param.channel} does not exist`);
            if (!this.channels[param.channel].triggers[param.name])
                throw new Error(`Trigger ${param.name} does not exist in channel ${param.channel}`);
            connection = this.channels[param.channel].connection;
        }
        else if (!this.triggers[param.name])
            throw new Error(`Trigger ${param.name} does not exist`);
        else
            connection = this.triggers[param.name].connection;
        var id = await akala.api.jsonrpcws(lifttt.channel).createClientProxy(connection).executeTrigger(param);
        this.triggerMap[id] = { connection, channel: param.channel, trigger: param.name };
    }

    public executeAction(param)
    {
        var connection: Connection;
        if (param.channel)
        {
            if (!this.channels[param.channel])
                throw new Error(`Channel ${param.channel} does not exist`);
            if (!this.channels[param.channel].actions[param.name])
                throw new Error(`Action ${param.name} does not exist in channel ${param.channel}`);
            connection = this.channels[param.channel].connection;
        }
        else if (!this.actions[param.name])
            throw new Error(`Action ${param.name} does not exist`);
        else
            connection = this.actions[param.name].connection;
        return akala.api.jsonrpcws(lifttt.channel).createClientProxy(connection).executeAction(param);
    }

    public executeCondition(param)
    {
        var connection: Connection;
        if (param.channel)
        {
            if (!this.channels[param.channel])
                throw new Error(`Channel ${param.channel} does not exist`);
            if (!this.channels[param.channel].conditions[param.name])
                throw new Error(`Condition ${param.name} does not exist in channel ${param.channel}`);
            connection = this.channels[param.channel].connection;
        }
        else if (!this.conditions[param.name])
            throw new Error(`Condition ${param.name} does not exist`);
        else
            connection = this.conditions[param.name].connection;
        return akala.api.jsonrpcws(lifttt.channel).createClientProxy(connection).executeCondition(param);
    }

    public registerTrigger(param, connection)
    {
        for (var i in this.channels)
        {
            if (this.channels[i].connection == connection)
            {
                if (this.channels[i].triggers[param.name])
                    throw new Error('a trigger named ' + param.name + ' already exists');
                this.channels[i].triggers[param.name] = { name: param.name, channel: this.channels[i].name, fields: param.fields };
                break;
            }
        }

        if (!(param.name in this.triggers))
            this.triggers[param.name] = { connection: connection, fields: param.fields, name: param.name, channel: this.channels[i].name };
    }

    public registerAction(param, connection)
    {
        for (var i in this.channels)
        {
            if (this.channels[i].connection == connection)
            {
                if (this.channels[i].actions[param.name])
                    throw new Error('an action named ' + param.name + ' already exists');
                this.channels[i].actions[param.name] = { name: param.name, channel: this.channels[i].name, fields: param.fields };
                break;
            }
        }

        if (!(param.name in this.actions))
            this.actions[param.name] = { connection: connection, fields: param.fields, name: param.name, channel: this.channels[i].name };
    }

    public registerCondition(param, connection)
    {
        for (var i in this.channels)
        {
            if (this.channels[i].connection == connection)
            {
                if (this.channels[i].conditions[param.name])
                    throw new Error('a condition named ' + param.name + ' already exists');
                this.channels[i].conditions[param.name] = { name: param.name, channel: this.channels[i].name, fields: param.fields };
                break;
            }
        }

        if (!(param.name in this.conditions))
            this.conditions[param.name] = { connection: connection, fields: param.fields, name: param.name, channel: this.channels[i].name };
    }

    public registerChannel(param, connection: Connection)
    {
        connection.on('close', (ev) =>
        {
            var channel = this.channels[param.name];
            delete this.channels[param.name];

        })

        this.channels[param.name] = { connection, name: param.name, icon: param.icon, view: param.view, iconLibrary:param.iconLibrary };
    }

    public async trigger(param)
    {
        await akala.api.jsonrpcws(lifttt.organizer).createClientProxy(this.triggerMap[param.id].connection).trigger(param);
        return;
    }

    public listChannels()
    {
        return Promise.resolve(akala.map(this.channels, function (channel)
        {
            return { name: channel.name, icon: channel.icon, view: channel.view, iconLibrary:channel.iconLibrary };
        }, true));
    }

    public listTriggers(param)
    {
        var channel = this.channels[param.channel];
        return Promise.resolve(channel.triggers);
    }

    public listActions(param)
    {
        var channel = this.channels[param.channel];
        return Promise.resolve(channel.actions);
    }

    public listConditions(param)
    {
        var channel = this.channels[param.channel];
        return Promise.resolve(channel.conditions);
    }
}
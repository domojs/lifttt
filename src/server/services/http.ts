import * as akala from '@akala/server'
import { channel } from '../channel'
import { Connection, Client } from '@akala/json-rpc-ws';
import * as fs from 'fs';

akala.injectWithNameAsync(['$agent.api/lifttt'], async (lifttt: Client<Connection>) =>
{
    var cl = akala.api.jsonrpcws(channel).createClient(lifttt, {
        executeAction: function (action)
        {
            switch (action.name)
            {
                case 'call':
                    var http: akala.Http = akala.resolve('$http');
                    return http.call(action.params as any).then((response) => { return; });
                    break;
            }
        },

        executeCondition: function (condition)
        {

        },
        stopTrigger: function (trigger)
        {

        },
        executeTrigger: async function (trigger)
        {
            return null;
        }
    });
    var server = cl.$proxy();
    await server.registerChannel({ name: 'http', icon: 'html5' });
    await server.registerAction({
        name: 'call', fields: [
            { name: 'url', type: 'string' },
            { name: 'method', type: 'string' },
            { name: 'queryString', type: 'string' },
            { name: 'body', type: 'string' },
            { name: 'headers', type: 'string' },
            { name: 'contentType', type: 'string' },
            { name: 'type', type: 'string' },
        ]
    })
})
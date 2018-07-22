import * as akala from '@akala/server'
import { channel } from '../channel'
import { Connection, Client } from '@akala/json-rpc-ws';
import * as fs from 'fs';

akala.injectWithNameAsync(['$agent.lifttt'], async (lifttt: Client<Connection>) =>
{
    var cl = akala.api.jsonrpcws(channel).createClient(lifttt, {
        executeAction: function (action)
        {
            switch (action.name)
            {
                case 'log':
                    console.log(action.fields.message);
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
    await server.registerChannel({ name: 'console', view: '@domojs/lifttt/fs.html', icon: 'terminal' });
    await server.registerAction({ name: 'log', fields: [{ name: 'message', type: 'string' }] })
})
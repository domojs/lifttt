import * as akala from '@akala/core';
import * as jsonrpcws from '@akala/json-rpc-ws';
import { IconName } from '@fortawesome/fontawesome-common-types';
import { Readable } from 'stream';

export interface Field
{
    name: string;
    displayName?: string;
    type: 'int' | 'string' | 'boolean';
}

export interface Recipe
{
    name: string;
    action: { name: string, params: jsonrpcws.SerializableObject };
    condition?: { name: string, params: jsonrpcws.SerializableObject }
}

export var organizer = new akala.Api()
    .clientToServer<{ name: string, params: jsonrpcws.SerializableObject }, string>()({ executeTrigger: true })
    .serverToClientOneWay<{ id: string, data: jsonrpcws.SerializableObject }>()({ trigger: true })
    .clientToServer<{ name: string, params: jsonrpcws.SerializableObject }, jsonrpcws.PayloadDataType>()({ executeCondition: true, executeAction: true })
    .serverToClient<null, Recipe[]>()({
        list: {
            rest: { method: 'get', url: '/api/recipe', type: 'json', param: 'query' }
        }
    })
    .serverToClient<{ name: string }, Recipe>()({
        get: {
            rest: { method: 'get', url: '/api/recipe/:name', type: 'json', param: { name: 'route' } }
        }
    })
    .serverToClientOneWay<{ name: string, recipe: Recipe }>()({
        update: {
            rest: { method: 'update', url: '/api/recipe/:name', type: 'json', param: { name: 'route', recipe: 'body' } }
        }
    })
    .serverToClientOneWay<Recipe>()({
        insert: {
            rest: { method: 'update', url: '/api/recipe', type: 'json', param: 'body' }
        }
    })


export var channel = new akala.Api()
    .clientToServerOneWay<{ name: string, fields: Field[], icon?: IconName, view?: string }>()({ registerTrigger: true, registerAction: true, registerCondition: true })
    .clientToServerOneWay<{ name: string, view?: string, icon: IconName }>()({ registerChannel: true })
    .serverToClient<{ name: string, fields: jsonrpcws.SerializableObject }, string>()({ executeTrigger: true })
    .serverToClientOneWay<{ name: string, fields: jsonrpcws.SerializableObject }>()({ executeCondition: true, executeAction: true })
    .clientToServerOneWay<{ id: string, data: jsonrpcws.SerializableObject }>()({ trigger: true })

    .clientToServer<null, string[]>()({
        listChannels: {
            rest: {
                method: 'get', url: '/api/@domojs/lifttt/channels', type: 'json', param: 'query'
            }
        }
    })
    .clientToServer<{ channel: string }, { name: string, fields: Field[] }[]>()({
        listTriggers: {
            rest: {
                method: 'get', url: '/api/@domojs/lifttt/:name/triggers', type: 'json', param: {
                    channel: 'route.name'
                }
            }
        },
        listConditions: {
            rest: {
                method: 'get', url: '/api/@domojs/lifttt/:name/conditions', type: 'json', param: {
                    channel: 'route.name'
                }
            }
        },
        listActions: {
            rest: {
                method: 'get', url: '/api/@domojs/lifttt/:name/actions', type: 'json', param: {
                    channel: 'route.name'
                }
            }
        },
    })
    ;
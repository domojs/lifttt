import * as akala from '@akala/server';
import { organizer, Recipe } from '../channel';
import { Client, Connection, SerializableObject, PayloadDataType } from '@akala/json-rpc-ws';
import * as fs from 'fs';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import * as path from 'path'

const logger = akala.logger('api');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

akala.injectWithNameAsync(['$agent.lifttt', '$worker'], function (client: Client<Connection>, worker: EventEmitter)
{
    var recipes: { [name: string]: Recipe & { triggerId?: string } } = {};
    var triggerMap: { [id: string]: Recipe } = {};
    var init: boolean;
    var recipeFile = path.resolve(process.cwd(), '../../../recipes.json');
    exists(recipeFile).then(async (exists) =>
    {
        if (exists)
        {
            logger.verbose(recipeFile + ' exists')
            var recipeStore: { [id: string]: Recipe } = JSON.parse(await readFile(recipeFile, { encoding: 'utf8' }));
            logger.verbose(recipeStore);
            init = true;
            worker.on('ready', function ()
            {
                setTimeout(function ()
                {

                    logger.verbose('initializing recipes')
                    akala.eachAsync(recipeStore, async function (recipe, name, next)
                    {
                        delete recipe.triggerId;
                        try
                        {
                            await cl.insert(recipe, init);
                        }
                        catch
                        {
                            setTimeout(cl.insert, 60000, recipe, true);
                        }
                        next();
                    }, function ()
                        {
                            init = false;
                        });
                }, 60000)
            })
        }
        else
            logger.info(recipeFile + ' does not exist');
    });
    function interpolate(obj: string | number | SerializableObject | SerializableObject[], data)
    {
        if (typeof (obj) == 'object')
        {
            if (Array.isArray(obj))
            {
                return akala.map(obj, function (e, key)
                {
                    return interpolate(e, data);
                });
            }
            else
                return akala.map(obj, function (e, key)
                {
                    return interpolate(e, data);
                });
        }
        else if (typeof (obj) == 'string')
            return akala.Interpolate.build(obj)(data);
        return obj;
    }

    var server = akala.api.jsonrpcws(organizer).createServerProxy(client);
    var cl = akala.api.jsonrpcws(organizer).createClient(client, {
        trigger: async (param) =>
        {
            var triggerData = param.data;
            var conditionsData: PayloadDataType = null;
            akala.logger.verbose(`trigger ${param.id} received`);
            if (triggerMap[param.id].condition)
            {
                var result = interpolate(triggerMap[param.id].condition.params, triggerData);
                conditionsData = await server.executeCondition({ name: triggerMap[param.id].condition.name, channel: triggerMap[param.id].condition.channel, params: { $triggerData: triggerData, ...result } });
            }

            await server.executeAction({ name: triggerMap[param.id].action.name, channel: triggerMap[param.id].action.channel, params: interpolate(triggerMap[param.id].action.params, { $triggerData: triggerData, $conditionsData: conditionsData }) });
        },
        async update(param)
        {
            if (!(param.name in recipes))
                return Promise.reject({ status: 404, message: 'recipe does not exist' });

            if (recipes[param.recipe.name].triggerId)
            {
                await server.stopTrigger({ id: recipes[param.recipe.name].triggerId });
                delete triggerMap[recipes[param.recipe.name].triggerId];
            }
            if (param.name != param.recipe.name)
            {
                delete recipes[param.name];
                param.recipe.name = param.name;
            }
            recipes[param.name] = param.recipe;
            await writeFile(recipeFile, JSON.stringify(recipes));
            recipes[param.recipe.name].triggerId = await server.executeTrigger(param.recipe.trigger);
            triggerMap[recipes[param.recipe.name].triggerId] = param.recipe;
        },
        async insert(recipe, init?: boolean)
        {
            if (recipe.name in recipes)
                return Promise.reject({ status: 403, message: 'recipe already exists' });

            recipes[recipe.name] = recipe;
            if (!init)
                await writeFile(recipeFile, JSON.stringify(recipes));
            logger.verbose(`requesting trigger ${recipe.trigger}`);
            recipes[recipe.name].triggerId = await server.executeTrigger(recipe.trigger);
            triggerMap[recipes[recipe.name].triggerId] = recipe;
        },
        get(param)
        {
            return recipes[param.name];
        },
        list()
        {
            return akala.map(recipes, function (recipe)
            {
                return recipe;
            }, true);
        }
    });
});
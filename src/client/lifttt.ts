import * as akala from '@akala/core';
import { organizer, Recipe } from '../server/channel';
import { Client, Connection, SerializableObject, PayloadDataType } from '@akala/json-rpc-ws';

const logger = { verbose: akala.log('verbose:domojs:lifttt:api'), info: akala.log('info:domojs:lifttt:api') }
const recipeFile = '@domojs/lifttt/recipes.json';

export function interpolate(obj: string | number | SerializableObject | SerializableObject[], data)
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

akala.injectWithNameAsync(['$agent.api/@domojs/lifttt'], function (client: Client<Connection>)
{
    var recipes: { [name: string]: Recipe & { triggerId?: string } } = {};
    var triggerMap: { [id: string]: Recipe } = {};
    var init: boolean;

    var recipesStoreContent = localStorage.getItem(recipeFile)

    if (recipesStoreContent)
    {
        var recipeStore: { [id: string]: Recipe } = JSON.parse(recipesStoreContent);
        logger.verbose(recipeStore);
        init = true;
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
    }
    else
        logger.info('no recipe to set up');

    var server = akala.api.jsonrpcws(organizer).createServerProxy(client);
    var cl = akala.api.jsonrpcws(organizer).createClient(client, {
        trigger: async (param) =>
        {
            var triggerData = akala.extend({ $date: new Date() }, param.data);
            var conditionsData: PayloadDataType = null;
            logger.verbose(`trigger ${param.id} received`);
            if (triggerMap[param.id].condition)
            {
                var result = interpolate(triggerMap[param.id].condition.params, triggerData);
                conditionsData = await server.executeCondition({ name: triggerMap[param.id].condition.name, channel: triggerMap[param.id].condition.channel, params: { $triggerData: triggerData, ...result } });
            }

            logger.verbose(`interpolating: ${JSON.stringify(triggerMap[param.id].action.params)}`);
            logger.verbose(`triggerData: ${JSON.stringify(triggerData)}`);
            logger.verbose(`conditionsData: ${JSON.stringify(conditionsData)}`);
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
            localStorage.setItem(recipeFile, JSON.stringify(recipes));
            recipes[param.recipe.name].triggerId = await server.executeTrigger(param.recipe.trigger);
            triggerMap[recipes[param.recipe.name].triggerId] = param.recipe;
        },
        async insert(recipe, init?: boolean)
        {
            if (recipe.name in recipes)
                return Promise.reject({ status: 403, message: 'recipe already exists' });

            recipes[recipe.name] = recipe;
            if (!init)
                localStorage.setItem(recipeFile, JSON.stringify(recipes));
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
import * as akala from '@akala/server';
import { organizer, Recipe } from './channel';
import { Client, Connection, SerializableObject } from '@akala/json-rpc-ws';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

akala.injectWithNameAsync(['$agent.lifttt'], function (client: Client<Connection>)
{
    var recipes: { [id: string]: Recipe } = {};
    var init: boolean;
    exists('./recipes.json').then(async (exists) =>
    {
        if (exists)
        {
            var recipeStore: { [id: string]: Recipe } = JSON.parse(await readFile('./recipes.json', { encoding: 'utf8' }));
            recipes = akala.extend(recipes, recipeStore);
            init = true;
            akala.eachAsync(recipeStore, async function (recipe, name, next)
            {
                await cl.insert(recipe, init);
                next();
            }, function ()
                {
                    init = false;
                });
        }
    })
    var server = akala.api.jsonrpcws(organizer).createServerProxy(client);
    var cl = akala.api.jsonrpcws(organizer).createClient(client, {
        trigger: async (param) =>
        {
            var data = param.data;

            if (recipes[param.id].condition)
                await server.executeCondition({ name: recipes[param.id].condition.name, params: akala.extend(data, recipes[param.id].condition.params) });

            await server.executeAction({ name: recipes[param.id].action.name, params: akala.extend(data, recipes[param.id].action.params) });
        },
        update(param)
        {
            if (!(param.name in recipes))
                return Promise.reject({ status: 404 });

            if (param.name != param.recipe.name)
                delete recipes[param.name]
            recipes[param.recipe.name] = param.recipe;
            return writeFile('./recipes.json', JSON.stringify(recipes));
        },
        insert(recipe, init?: boolean)
        {
            if (recipe.name in recipes)
                return Promise.reject({ status: 403 });

            recipes[recipe.name] = recipe;
            if (!init)
                return writeFile('./recipes.json', JSON.stringify(recipes));
        },
        get(param)
        {
            return recipes[param.name];
        },
        list()
        {
            return akala.map(recipes, function (recipe)
            {
                return recipe
            }, true);
        }
    });
});
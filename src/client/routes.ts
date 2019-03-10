import { channel, organizer, Recipe } from '../server/channel';
import * as akala from '@akala/client';
import { Tile } from '@domojs/theme-default/dist/tile'
import './lifttt';


akala.run(['$part', '$http', '$location', '$injector'], function (part: akala.Part, http: akala.Http, location: akala.LocationService, injector: akala.Injector)
{
    var api = akala.api.rest(new akala.DualApi(organizer, channel)).createServerProxy(new URL('/api/@domojs/lifttt', window.location.origin).toString());

    part.use('/lifttt', 'body', {
        template: '/@domojs/theme-default/tiles.html', controller: function (scope, elem, params)
        {
            scope['list'] = api.listOrganizers().then((organizers) =>
            {
                return organizers.map((organizer) => 
                {
                    return {
                        name: organizer,
                        url: '/lifttt/' + organizer
                    }
                });
            });
            scope['tileClick'] = function (tile: Tile, $location: akala.LocationService, $http: akala.Http)
            {
                $location.show(tile.url);
            }
        }
    })

    part.use('/lifttt/:name', 'body', {
        template: '/@domojs/theme-default/tiles.html', controller: function (scope, elem, params)
        {
            scope['list'] = api.list({ id: params.name });
            scope['tileClick'] = function (tile: Recipe, $location: akala.LocationService, $http: akala.Http)
            {
                $location.show('/lifttt/' + params.name + '/' + tile.name);
            }
        }
    })

    part.use('/lifttt/:name/:recipe', 'body', {
        template: '/@domojs/lifttt/edit.html', controller: function (scope, elem, params)
        {
            scope['recipe'] = api.get({ id: params.name, name: params.recipe });

        }
    })

    part.use('/lifttt', 'commands', {
        template: '/@domojs/lifttt/commands.html'
        , controller: function (scope, element, params, next)
        {
            next();
        }
    });
});
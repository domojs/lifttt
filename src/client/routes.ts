import { channel, organizer, Recipe } from '../server/channel';
import * as akala from '@akala/client';
import { Tile } from '@domojs/theme-default/dist/tile'
import './lifttt';


akala.run(['$part', '$http', '$location', '$injector'], function (part: akala.Part, http: akala.Http, location: akala.LocationService, injector: akala.Injector)
{
    part.use('/lifttt', 'body', {
        template: '/@domojs/theme-default/tiles.html', controller: function (scope, elem, params)
        {
            var api = akala.api.rest(new akala.DualApi(organizer, channel)).createServerProxy(new URL('/api/@domojs/lifttt', window.location.origin).toString());
            scope['list'] = api.listOrganizers();
            scope['tileClick'] = function (tile: string, $location: akala.LocationService, $http: akala.Http)
            {
                $location.show('/lifttt/' + tile);
            }
        }
    })

    part.use('/lifttt/:name', 'body', {
        template: '/@domojs/theme-default/tiles.html', controller: function (scope, elem, params)
        {
            var api = akala.api.rest(new akala.DualApi(organizer, channel)).createServerProxy(new URL('/api/@domojs/lifttt', window.location.origin).toString());
            scope['list'] = api.list({ id: params.name });
            scope['tileClick'] = function (tile: Recipe, $location: akala.LocationService, $http: akala.Http)
            {
                $location.show('/lifttt/' + params.name + '/' + tile.name);
            }
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
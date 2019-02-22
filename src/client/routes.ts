import { channel, organizer } from '../server/channel';
import * as akala from '@akala/client';
import { Tile } from '@domojs/theme-default/dist/tile'
import './lifttt';


akala.run(['$part', '$http', '$location', '$injector'], function (part: akala.Part, http: akala.Http, location: akala.LocationService, injector: akala.Injector)
{
    part.use('/lifttt', 'body', {
        template: '/@domojs/theme-default/tiles.html', controller: function (scope, elem, params)
        {
            var api = akala.api.rest(new akala.DualApi(organizer, channel)).createServerProxy(new URL('/api/@domojs/lifttt', window.location.origin).toString());
            scope['list'] = api.list(null);
            scope['tileClick'] = function (tile: Tile, $location: akala.LocationService, $http: akala.Http)
            {
                if (tile.url)
                    if (akala.isPromiseLike(tile.url))
                        tile.url.then(function (url) { $location.show(url) });
                    else
                        $location.show(tile.url);
                if (tile.cmd)
                    $http.get(tile.cmd)
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
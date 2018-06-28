import { channel, organizer } from '../server/channel';
import * as akala from '@akala/client';
import { Tile } from '@domojs/theme-default/dist/tile'


akala.run(['$part', '$http', '$location', '$injector'], function (part: akala.Part, http: akala.Http, location: akala.LocationService, injector: akala.Injector)
{
    part.use('/lifttt', 'body', {
        template: '/@domojs/theme-default/tiles.html', controller: function (scope, elem, params)
        {
            var api = akala.api.rest(new akala.DualApi(organizer, channel)).createServerProxy(new URL('/api/@domojs/lifttt/', window.location.origin).toString());
            scope['list'] = api.listChannels(null);
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

    part.use('/media', 'commands', {
        template: '/@domojs/media/commands.html'
        , controller: function (scope, element, params, next)
        {
            next();
        }
    });

    interface MediaConfigScope extends akala.IScope<MediaConfigScope>
    {
        newItems: akala.ObservableArray<any>;
        addNewItem(): void;
    }

    part.use('/config/media', 'body', {
        template: '/@domojs/media/config.html'
        , controller: function (scope: MediaConfigScope, element, params, next)
        {
            scope.newItems = new akala.ObservableArray([]);
            scope.addNewItem = function ()
            {
                scope.newItems.push({ path: '', name: '' });
            }
        }
    });
});
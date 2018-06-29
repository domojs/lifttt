import * as akala from '@akala/server';
import { AssetRegistration } from '@akala-modules/core';
import { EventEmitter } from 'events';

akala.injectWithName(['$isModule', '$master', '$worker'], function (isModule: akala.worker.IsModule, master: akala.worker.MasterRegistration, worker: EventEmitter)
{
    if (isModule('@domojs/lifttt'))
    {
        worker.on('ready', function ()
        {
            // Called when all modules have been initialized
        });

        worker.on('after-master', function ()
        {
            require('./api');
        });
        
        master(__filename, './master');


        akala.injectWithName([AssetRegistration.name], function (virtualasset: PromiseLike<AssetRegistration>)
        {
            virtualasset.then((va) =>
            {
                va.register('/js/tiles.js', require.resolve('../tile'));
                va.register('/js/routes.js', require.resolve('../routes'));
            });
        })();

    }
})()
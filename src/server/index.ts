import * as akala from '@akala/server';
import { AssetRegistration } from '@akala-modules/core';
import { EventEmitter } from 'events';
export * from './channel';

const pkgName = require('../../package.json').name;

akala.module(pkgName).init([AssetRegistration.name], async function (virtualasset: PromiseLike<AssetRegistration>)
{
    require('./services/console');
    require('./services/fs');
    require('./services/http');
    require('./api');

    require('./master');

    var va = await virtualasset;
    va.register('/js/tiles.js', require.resolve('../tile'));
    va.register('/js/routes.js', require.resolve('../routes'));
});
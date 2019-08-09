///<reference types='@akala/client' />
///<reference types="@domojs/theme-default/dist/tile" />

akala.module('@domojs/lifttt').run(['tiles'], function (tiles: tiles.TileService)
{
    tiles.add({
        text: 'Evenements',
        icon: 'bolt',
        url: '/lifttt'
    });
})
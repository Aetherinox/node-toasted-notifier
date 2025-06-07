/* eslint-disable no-console */
const path = require( 'path' );
const toasted = require( '../index' );

/*
    Push notifications
*/

toasted.notify(
    {
        message: 'Are you sure you want to continue?',
        icon: path.join( __dirname, 'example_1.png' ),
        actions: [ 'OK', 'Cancel' ]
    },
    ( err, data ) =>
    {
        // Will also wait until notification is closed.
        console.log( 'Waited' );
        console.log( JSON.stringify({ err, data }, null, '\t' ) );
    }
);

// Built-in actions:
toasted.on( 'timeout', () =>
{
    console.log( 'Timed out!' );
});
toasted.on( 'activate', () =>
{
    console.log( 'Clicked!' );
});
toasted.on( 'dismissed', () =>
{
    console.log( 'Dismissed!' );
});

// Buttons actions (lower-case):
toasted.on( 'ok', () =>
{
    console.log( '"Ok" was pressed' );
});
toasted.on( 'cancel', () =>
{
    console.log( '"Cancel" was pressed' );
});

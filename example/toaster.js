/* eslint-disable no-console */

const path = require( 'path' );
const toasted = require( '../index' );

toasted.notify(
    {
        message: 'This is a longer notification which\ndisplays numerous lines of text for\nthe user to see.\nNice.',
        icon: path.join( __dirname, 'example_1.png' ),
        sound: true
    },
    ( err, data ) =>
    {
        // Will also wait until notification is closed.
        console.log( 'Waited' );
        console.log( JSON.stringify({ err, data }) );
    }
);

toasted.on( 'timeout', () =>
{
    console.log( 'Timed out!' );
});

toasted.on( 'click', () =>
{
    console.log( 'Clicked!' );
});

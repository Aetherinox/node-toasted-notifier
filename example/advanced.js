/* eslint-disable no-console */

const toasted = require( '../' );
const nc = new toasted.NotificationCenter();
const path = require( 'path' );

nc.notify(
    {
        title: 'Test Notification',
        subtitle: 'This is a subtitle',
        message: 'This is an advanced test message',
        sound: 'Funk',
        wait: true,
        icon: path.join( __dirname, 'example_1.png' ),
        contentImage: path.join( __dirname, 'example_1.png' ),
        open: 'file://' + path.join( __dirname, 'example_1.png' )
    },
    ( ...args ) =>
    {
        console.log( args );
    }
);

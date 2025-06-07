/* eslint-disable no-console */

const toasted = require( '../index' );

toasted
    .notify({ message: 'Hello', wait: true }, ( err, data ) =>
    {
        // wait until notification is closed.
        console.log( 'Waited' );
        console.log( err, data );
    })
    .on( 'click', ( ...args ) =>
    {
        console.log( args );
    });

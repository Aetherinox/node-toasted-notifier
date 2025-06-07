/* eslint-disable no-console */
const toasted = require( '../index' );

const balloon = toasted.WindowsBalloon();
balloon
    .notify({ message: 'Hello' }, ( err, data ) =>
    {
        console.log( err, data );
    })
    .on( 'click', ( ...args ) =>
    {
        console.log( args );
    });

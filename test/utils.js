const path = require( 'path' );
const fs = require( 'fs' );
const _ = require( '../lib/utils' );

describe( 'utils', () =>
{
    describe( 'clone', () =>
    {
        it( 'should clone nested objects', () =>
        {
            const obj = { a: { b: 42 }, c: 123 };
            const obj2 = _.clone( obj );

            expect( obj ).toEqual( obj2 );
            obj.a.b += 2;
            obj.c += 2;
            expect( obj ).not.toEqual( obj2 );
        });
    });

    describe( 'mapping', () =>
    {
        it( 'should map icon for notify-send', () =>
        {
            const expected = {
                title: 'Foo',
                message: 'Bar',
                icon: 'foobar',
                'expire-time': 10000
            };

            expect( _.mapToNotifySend({ title: 'Foo', message: 'Bar', appIcon: 'foobar' }) ).toEqual( expected );
            expect( _.mapToNotifySend({ title: 'Foo', message: 'Bar', i: 'foobar' }) ).toEqual( expected );
        });

        it( 'should map short hand for notify-sned', () =>
        {
            const expected =
            {
                urgency: 'a',
                'expire-time': 'b',
                category: 'c',
                icon: 'd',
                hint: 'e'
            };

            expect( _.mapToNotifySend({ u: 'a', e: 'b', c: 'c', i: 'd', h: 'e' }) ).toEqual( expected );
        });

        it( 'should map icon for notification center', () =>
        {
            const expected =
            {
                title: 'Foo',
                message: 'Bar',
                appIcon: 'foobar',
                timeout: 10,
                json: true
            };

            expect( _.mapToMac({ title: 'Foo', message: 'Bar', icon: 'foobar' }) ).toEqual( expected );
            expect( _.mapToMac({ title: 'Foo', message: 'Bar', i: 'foobar' }) ).toEqual( expected );
        });

        it( 'should map icon for growl', () =>
        {
            const icon = path.join( __dirname, 'fixture', 'example_1.png' );
            const iconRead = fs.readFileSync( icon );

            const expected = { title: 'Foo', message: 'Bar', icon: iconRead };

            let obj = _.mapToGrowl({ title: 'Foo', message: 'Bar', icon });
            expect( obj ).toEqual( expected );

            expect( obj.icon ).toBeTruthy();
            expect( Buffer.isBuffer( obj.icon ) ).toBeTruthy();

            obj = _.mapToGrowl({ title: 'Foo', message: 'Bar', appIcon: icon });

            expect( obj.icon ).toBeTruthy();
            expect( Buffer.isBuffer( obj.icon ) ).toBeTruthy();
        });

        it( 'should not map icon url for growl', () =>
        {
            const icon = 'http://hostname.com/logo.png';

            const expected = { title: 'Foo', message: 'Bar', icon };

            expect( _.mapToGrowl({ title: 'Foo', message: 'Bar', icon }) ).toEqual( expected );

            expect( _.mapToGrowl({ title: 'Foo', message: 'Bar', appIcon: icon }) ).toEqual( expected );
        });
    });
});

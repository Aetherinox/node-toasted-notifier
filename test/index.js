const notifier = require( '../' );

describe( 'constructors', () =>
{
    it( 'should expose a default selected instance', () =>
    {
        expect( notifier.notify ).toBeTruthy();
    });

    it( 'should expect only a function callback as second parameter', () =>
    {
        function cb() {}
        expect( notifier.notify({ title: 'My notification' }, cb ) ).toBeTruthy();
    });

    it( 'should throw error when second parameter is not a function', () =>
    {
        const wrongParamOne = 200;
        const wrongParamTwo = 'meaningless string';
        const data = { title: 'My notification' };

        const base = notifier.notify.bind( notifier, data );
        expect( base.bind( notifier, wrongParamOne ) ).toThrowError( /^The second argument/ );
        expect( base.bind( notifier, wrongParamTwo ) ).toThrowError( /^The second argument/ );
    });

    it( 'should expose a default selected constructor function', () =>
    {
        expect( notifier ).toBeInstanceOf( notifier.Notification );
    });

    it( 'should expose constructor for WindowsBalloon', () =>
    {
        expect( notifier.WindowsBalloon ).toBeTruthy();
    });

    it( 'should expose constructor for WindowsToaster', () =>
    {
        expect( notifier.WindowsToaster ).toBeTruthy();
    });

    it( 'should expose constructor for NotifySend', () =>
    {
        expect( notifier.NotifySend ).toBeTruthy();
    });

    it( 'should expose constructor for Growl', () =>
    {
        expect( notifier.Growl ).toBeTruthy();
    });
});

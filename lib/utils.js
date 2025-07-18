/* eslint-disable no-console */
const shellwords = require( 'shellwords' );
const cp = require( 'child_process' );
const semver = require( 'semver' );
const isWSL = require( 'is-wsl' );
const path = require( 'path' );
const url = require( 'url' );
const os = require( 'os' );
const fs = require( 'fs' );
const net = require( 'net' );

const BUFFER_SIZE = 1024;

function clone( obj )
{
    return JSON.parse( JSON.stringify( obj ) );
}

module.exports.clone = clone;

const escapeQuotes = function ( str )
{
    if ( typeof str === 'string' )
        return str.replace( /(["$`\\])/g, '\\$1' );
    else
        return str;
};

const inArray = function ( arr, val )
{
    return arr.indexOf( val ) !== -1;
};

/*
    notifySend Flags
*/

const notifySendFlags = {
    u: 'urgency',
    urgency: 'urgency',
    t: 'expire-time',
    time: 'expire-time',
    timeout: 'expire-time',
    e: 'expire-time',
    expire: 'expire-time',
    'expire-time': 'expire-time',
    i: 'icon',
    icon: 'icon',
    c: 'category',
    category: 'category',
    subtitle: 'category',
    h: 'hint',
    hint: 'hint',
    a: 'app-name',
    'app-name': 'app-name'
};

module.exports.command = function ( notifier, options, cb )
{
    notifier = shellwords.escape( notifier );
    if ( process.env.DEBUG && process.env.DEBUG.indexOf( 'toasted' ) !== -1 )
    {
        console.info( 'toasted-notifier debug info (command):' );
        console.info( '[toast path]', notifier );
        console.info( '[toast options]', options.join( ' ' ) );
    }

    return cp.exec( notifier + ' ' + options.join( ' ' ), ( error, stdout, stderr ) =>
    {
        if ( error ) return cb( error );
        cb( stderr, stdout );
    });
};

module.exports.fileCommand = function ( notifier, options, cb )
{
    if ( process.env.DEBUG && process.env.DEBUG.indexOf( 'toasted' ) !== -1 )
    {
        console.info( 'toasted-notifier debug info (fileCommand):' );
        console.info( '[toast path]', notifier );
        console.info( '[toast options]', options.join( ' ' ) );
    }

    return cp.execFile( notifier, options, ( error, stdout, stderr ) =>
    {
        if ( error ) return cb( error, stdout );
        cb( stderr, stdout );
    });
};

module.exports.fileCommandJson = function ( notifier, options, cb )
{
    if ( process.env.DEBUG && process.env.DEBUG.indexOf( 'toasted' ) !== -1 )
    {
        console.info( 'toasted-notifier debug info (fileCommandJson):' );
        console.info( '[toast path]', notifier );
        console.info( '[toast options]', options.join( ' ' ) );
    }

    return cp.execFile( notifier, options, ( error, stdout, stderr ) =>
    {
        if ( error ) return cb( error, stdout );
        if ( !stdout ) return cb( error, {});

        try
        {
            const data = JSON.parse( stdout );
            cb( !stderr ? null : stderr, data );
        }
        catch ( e )
        {
            cb( e, stdout );
        }
    });
};

module.exports.immediateFileCommand = function ( notifier, options, cb )
{
    if ( process.env.DEBUG && process.env.DEBUG.indexOf( 'toasted' ) !== -1 )
    {
        console.info( 'toasted-notifier debug info (Toast):' );
        console.info( '[toast path]', notifier );
    }

    notifierExists( notifier, ( _, exists ) =>
    {
        if ( !exists )
            return cb( new Error( 'Notifier (' + notifier + ') not found on system.' ) );

        cp.execFile( notifier, options );
        cb();
    });
};

function notifierExists( notifier, cb )
{
    return fs.stat( notifier, ( err, stat ) =>
    {
        if ( !err ) return cb( err, stat.isFile() );

        // Check if Windows alias
        if ( path.extname( notifier ) )
        {
            // Has extentioon, no need to check more
            return cb( err, false );
        }

        // Check if there is an exe file in the directory
        return fs.stat( notifier + '.exe', ( err, stat ) =>
        {
            if ( err ) return cb( err, false );
            cb( err, stat.isFile() );
        });
    });
}

const mapAppIcon = function ( options )
{
    if ( options.appIcon )
    {
        options.icon = options.appIcon;
        delete options.appIcon;
    }

    return options;
};

const mapText = function ( options )
{
    if ( options.text )
    {
        options.message = options.text;
        delete options.text;
    }

    return options;
};

const mapIconShorthand = function ( options )
{
    if ( options.i )
    {
        options.icon = options.i;
        delete options.i;
    }

    return options;
};

module.exports.mapToNotifySend = function ( options )
{
    options = mapAppIcon( options );
    options = mapText( options );

    if ( options.timeout === false )
    {
        delete options.timeout;
    }

    if ( options.wait === true )
    {
        options[ 'expire-time' ] = 5; // 5 seconds default time (multipled below)
    }

    for ( const key in options )
    {
        if ( key === 'message' || key === 'title' ) continue;

        if ( Object.prototype.hasOwnProperty.call( options,  key ) && notifySendFlags[ key ] !== key )
        {
            options[ notifySendFlags[ key ] ] = options[ key ];
            delete options[ key ];
        }
    }

    if ( typeof options[ 'expire-time' ] === 'undefined' )
        options[ 'expire-time' ] = 10 * 1000; // 10 sec timeout by default
    else if ( typeof options[ 'expire-time' ] === 'number' )
        options[ 'expire-time' ] = options[ 'expire-time' ] * 1000; // notify send uses milliseconds

    return options;
};

module.exports.mapToGrowl = function ( options )
{
    options = mapAppIcon( options );
    options = mapIconShorthand( options );
    options = mapText( options );

    if ( options.icon && !Buffer.isBuffer( options.icon ) )
    {
        try
        {
            options.icon = fs.readFileSync( options.icon );
        }
        catch ( ex ) {}
    }

    return options;
};

module.exports.mapToMac = function ( options )
{
    options = mapIconShorthand( options );
    options = mapText( options );

    if ( options.icon )
    {
        options.appIcon = options.icon;
        delete options.icon;
    }

    if ( options.sound === true )
        options.sound = 'Bottle';

    if ( options.sound === false )
        delete options.sound;

    if ( options.sound && options.sound.indexOf( 'Notification.' ) === 0 )
        options.sound = 'Bottle';

    /*
        wait        : Wait with callback, until user action is taken against notification,
                      does not apply to Windows Toasters as they always wait or notify-send
                      as it does not support the wait option

        timeout     : Takes precedence over wait if both are defined.
    */

    if ( options.wait === true )
    {
        if ( !options.timeout )
            options.timeout = 5;

        delete options.wait;
    }

    if ( !options.wait && !options.timeout )
    {
        if ( options.timeout === false )
            delete options.timeout;
        else
            options.timeout = 10;
    }

    options.json = true;

    return options;
};

function isArray( arr )
{
    return Object.prototype.toString.call( arr ) === '[object Array]';
}
module.exports.isArray = isArray;

function noop() {}
module.exports.actionJackerDecorator = function ( emitter, options, fn, mapper )
{
    options = clone( options );
    fn = fn || noop;

    if ( typeof fn !== 'function' )
    {
        throw new TypeError( 'The second argument must be a function callback. You have passed ' + typeof fn );
    }

    return function ( err, data )
    {
        let resultantData = data;
        let metadata = {};

        // Allow for extra data if resultantData is an object
        if ( resultantData && typeof resultantData === 'object' )
        {
            metadata = resultantData;
            resultantData = resultantData.activationType;
        }

        // Sanitize the data
        if ( resultantData )
        {
            resultantData = resultantData.toLowerCase().trim();

            if ( resultantData.match( /^activate|clicked$/ ) )
            {
                resultantData = 'activate';
            }

            if ( resultantData.match( /^timedout$/ ) )
            {
                resultantData = 'timeout';
            }
        }

        fn.apply( emitter, [ err, resultantData, metadata ] );
        if ( !mapper || !resultantData ) return;

        const key = mapper( resultantData );
        if ( !key ) return;
        emitter.emit( key, emitter, options, metadata );
    };
};

module.exports.constructArgumentList = function ( options, extra )
{
    const args = [];
    extra = extra || {};

    // Massive ugly setup. Default args
    const initial = extra.initial || [];
    const keyExtra = extra.keyExtra || '';
    const allowedArguments = extra.allowedArguments || [];
    const noEscape = extra.noEscape !== undefined;
    const checkForAllowed = extra.allowedArguments !== undefined;
    const explicitTrue = !!extra.explicitTrue;
    const keepNewlines = !!extra.keepNewlines;
    const wrapper = extra.wrapper === undefined ? '"' : extra.wrapper;

    const escapeFn = function escapeFn( arg )
    {
        if ( isArray( arg ) )
        {
            return removeNewLines( arg.map( escapeFn ).join( ',' ) );
        }

        if ( !noEscape )
        {
            arg = escapeQuotes( arg );
        }

        if ( typeof arg === 'string' && !keepNewlines )
        {
            arg = removeNewLines( arg );
        }

        return wrapper + arg + wrapper;
    };

    initial.forEach( ( val ) =>
    {
        args.push( escapeFn( val ) );
    });

    for ( const key in options )
    {
        if ( Object.prototype.hasOwnProperty.call( options,  key ) && ( !checkForAllowed || inArray( allowedArguments, key ) ) )
        {
            if ( explicitTrue && options[ key ] === true )
            {
                args.push( '-' + keyExtra + key );
            }
            else if ( explicitTrue && options[ key ] === false ) continue;
            else args.push( '-' + keyExtra + key, escapeFn( options[ key ] ) );
        }
    }
    return args;
};

function removeNewLines( str )
{
    const excapedNewline = process.platform === 'win32' ? '\\r\\n' : '\\n';
    return str.replace( /\r?\n/g, excapedNewline );
}

/*
    Ntfy Toast / Toaster

    Windows 10 & 11 use ntfy-toast library to send notifications:
        https://github.com/Aetherinox/ntfy-toast

    ntfy-toast has a special parameter for ensuring that notifications stick and do dismiss
    unless the user physically dismisses them by using:
        -persistent

    @ref        : https://learn.microsoft.com/en-us/windows/apps/design/shell/tiles-and-notifications/adaptive-interactive-toasts?tabs=xml

    ---- Options ----
    [-t] <title string>                     | Displayed on the first line of the toast.
    [-m] <message string>                   | Displayed on the remaining lines, wrapped.
    [-b] <button1;button2 string>           | Displayed on the bottom line, can list multiple buttons separated by ";"
    [-tb]                                   | Displayed a textbox on the bottom line, only if buttons are not presented.
    [-p] <image URI>                        | Display toast with an image, local files only.
    [-id] <id>                              | sets the id for a notification to be able to close it later.
    [-s] <sound URI>                        | Sets the sound of the notifications, for possible values see http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx.
    [-silent]                               | Don't play a sound file when showing the notifications.
    [-persistent]                           | Makes the notification stick until the user dismisses it.
    [-d] (short | long)                     | Set the duration default is "short" 7s, "long" is 25s.
    [-appID] <App.ID>                       | Don't create a shortcut but use the provided app id.
    [-pid] <pid>                            | Query the appid for the process <pid>, use -appID as fallback. (Only relevant for applications that might be packaged for the store)
    [-pipeName] <\.\pipe\pipeName\>         | Provide a name pipe which is used for callbacks.
    [-application] <C:\foo.exe>             | Provide a application that might be started if the pipe does not exist.
    -close <id>                             | Closes a currently displayed notification.
*/
const allowedToasterFlags = [
    't',
    'm',
    'b',
    'tb',
    'p',
    'id',
    's',
    'd',
    'silent',
    'persistent',
    'appID',
    'pid',
    'pipeName',
    'close',
    'install'
];

const toasterSoundPrefix = 'Notification.';
const toasterDefaultSound = 'Notification.Default';
module.exports.mapToWin8 = function ( options )
{
    options = mapAppIcon( options );
    options = mapText( options );

    if ( options.icon )
    {
        if ( /^file:\/+/.test( options.icon ) )
        {
            // should parse file protocol URL to path
            // eslint-disable-next-line n/prefer-global/url
            options.p = new url.URL( options.icon ).pathname.replace( /^\/(\w:\/)/, '$1' ).replace( /\//g, '\\' );
        }
        else
        {
            options.p = options.icon;
        }

        delete options.icon;
    }

    if ( options.message )
    {
        // Remove escape char to debug "HRESULT : 0xC00CE508" exception
        // eslint-disable-next-line no-control-regex
        options.m = options.message.replace( /\x1b/g, '' );
        delete options.message;
    }

    if ( options.title )
    {
        options.t = options.title;
        delete options.title;
    }

    if ( options.appName )
    {
        options.appID = options.appName;
        delete options.appName;
    }

    if ( typeof options.remove !== 'undefined' )
    {
        options.close = options.remove;
        delete options.remove;
    }

    if ( options.quiet || options.silent )
    {
        options.silent = options.quiet || options.silent;
        delete options.quiet;
    }

    if ( typeof options.sound !== 'undefined' )
    {
        options.s = options.sound;
        delete options.sound;
    }

    /*
        Wait, sticky are aliases for persistent.
    */

    if ( options.wait === true || options.sticky === true )
    {
        options.persistent = true;
        delete options.wait;
        delete options.sticky;
    }

    /*
        -d (duration) flag for ntfytoast
        must be one of two options:
            -d short | long

        short   : 7 seconds
        long    : 25 seconds
    */

    if ( options.timeout )
    {
        if ( options.timeout === 'long' || ( typeof options.timeout === 'number' && options.timeout > 7 ) )
        {
            options.d = 'long';
        }
        else if ( typeof options.timeout === 'number' && options.timeout === 0 )
        {
            options.persistent = true;
            delete options.timeout;
        }
        else
        {
            options.d = 'short';
        }
    }

    if ( options.s === false )
    {
        options.silent = true;
        delete options.s;
    }

    // Silent takes precedence. Remove sound.
    if ( options.s && options.silent )
    {
        delete options.s;
    }

    if ( options.s === true )
    {
        options.s = toasterDefaultSound;
    }

    if ( options.s && options.s.indexOf( toasterSoundPrefix ) !== 0 )
    {
        options.s = toasterDefaultSound;
    }

    if ( options.actions && isArray( options.actions ) )
    {
        options.b = options.actions.join( ';' );
        delete options.actions;
    }

    for ( const key in options )
    {
        // Check if is allowed. If not, delete!
        if ( Object.prototype.hasOwnProperty.call( options,  key ) && allowedToasterFlags.indexOf( key ) === -1 )
        {
            delete options[ key ];
        }
    }

    return options;
};

module.exports.mapToNotifu = function ( options )
{
    options = mapAppIcon( options );
    options = mapText( options );

    if ( options.icon )
    {
        options.i = options.icon;
        delete options.icon;
    }

    if ( options.message )
    {
        options.m = options.message;
        delete options.message;
    }

    if ( options.title )
    {
        options.p = options.title;
        delete options.title;
    }

    if ( options.time )
    {
        options.d = options.time;
        delete options.time;
    }

    if ( options.q !== false )
    {
        options.q = true;
    }
    else
    {
        delete options.q;
    }

    if ( options.quiet === false )
    {
        delete options.q;
        delete options.quiet;
    }

    if ( options.sound )
    {
        delete options.q;
        delete options.sound;
    }

    if ( options.t )
    {
        options.d = options.t;
        delete options.t;
    }

    if ( options.type )
    {
        options.t = sanitizeNotifuTypeArgument( options.type );
        delete options.type;
    }

    return options;
};

module.exports.isMac = function ()
{
    return os.type() === 'Darwin';
};

module.exports.isMountainLion = function ()
{
    return os.type() === 'Darwin' && semver.satisfies( garanteeSemverFormat( os.release() ), '>=12.0.0' );
};

module.exports.isWin8 = function ()
{
    return os.type() === 'Windows_NT' && semver.satisfies( garanteeSemverFormat( os.release() ), '>=6.2.9200' );
};

module.exports.isWSL = function ()
{
    return isWSL;
};

module.exports.isLessThanWin8 = function ()
{
    return os.type() === 'Windows_NT' && semver.satisfies( garanteeSemverFormat( os.release() ), '<6.2.9200' );
};

function garanteeSemverFormat( version )
{
    if ( version.split( '.' ).length === 2 )
    {
        version += '.0';
    }
    return version;
}

function sanitizeNotifuTypeArgument( type )
{
    if ( typeof type === 'string' || type instanceof String )
    {
        if ( type.toLowerCase() === 'info' ) return 'info';
        if ( type.toLowerCase() === 'warn' ) return 'warn';
        if ( type.toLowerCase() === 'error' ) return 'error';
    }

    return 'info';
}

module.exports.createNamedPipe = ( server ) =>
{
    const buf = Buffer.alloc( BUFFER_SIZE );

    return new Promise( ( resolve ) =>
    {
        server.instance = net.createServer( ( stream ) =>
        {
            stream.on( 'data', ( c ) =>
            {
                buf.write( c.toString() );
            });
            stream.on( 'end', () =>
            {
                server.instance.close();
            });
        });
        server.instance.listen( server.namedPipe, () =>
        {
            resolve( buf );
        });
    });
};

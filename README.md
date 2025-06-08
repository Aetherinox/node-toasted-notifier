<div align="center">
<h1>♾️ Toasted Notifier ♾️</h1>
<br />

<p>

**Toasted Notifier** is a forked verison of [node-notifier](https://github.com/mikaelbr/node-notifier) which has been updated with various changes. It allows for you to display push notifications within your application for Windows, Linux, and macOS. 

<br />

This library is packaged with [ntfy-desktop](https://github.com/Aetherinox/ntfy-desktop)

</p>

<br />

<div align="center">

<!-- prettier-ignore-start -->
[![Version][badge-version-gh]][link-version-gh] [![Build Status][badge-build]][link-build] [![Downloads][badge-downloads-gh]][link-downloads-gh] [![Size][badge-size-gh]][badge-size-gh] [![Last Commit][badge-commit]][badge-commit]
<!-- prettier-ignore-end -->

</div>

<br />

<div align="center">

<img src="https://github.com/Aetherinox/toasted-notifier/assets/118329232/8ed8330f-2f1f-43e1-9264-cb5ead9314f0" width="630">

<br />

<img src="https://github.com/Aetherinox/toasted-notifier/assets/118329232/ca453129-bf45-4b92-9979-447219b7df02" width="630">

<br />

<img src="https://github.com/Aetherinox/toasted-notifier/assets/118329232/f2ec9a0f-07f0-4cef-b791-99cf97a9fa39" width="630">

</div>

</div>

<br />

---

<br />

- [About](#about)
  - [What is ntfy-toast](#what-is-ntfy-toast)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
  - [Cross-Platform Advanced Usage](#cross-platform-advanced-usage)
  - [Fine-grained Control](#fine-grained-control)
  - [Specific Vendor Documentation](#specific-vendor-documentation)
    - [NotificationCenter](#notificationcenter)
      - [Sounds](#sounds)
      - [Custom Path](#custom-path)
      - [Spotlight](#spotlight)
    - [WindowsToaster](#windowstoaster)
      - [Notifications Not Working](#notifications-not-working)
      - [Windows 10 Fall Creators Update (Version 1709):](#windows-10-fall-creators-update-version-1709)
    - [Growl](#growl)
    - [WindowsBalloon](#windowsballoon)
    - [NotifySend](#notifysend)
  - [appID support](#appid-support)
    - [Create App Shortcut](#create-app-shortcut)
    - [Call App](#call-app)
  - [Help](#help)
    - [How to change text `NtfyToast` at the top of notifications](#how-to-change-text-ntfytoast-at-the-top-of-notifications)
    - [Can't use Windows Toast notifications in WSL2](#cant-use-windows-toast-notifications-in-wsl2)
    - [Distributing with Electron](#distributing-with-electron)
    - [Using Webpack](#using-webpack)
    - [Windows: Where are files / .lnk files placed](#windows-where-are-files--lnk-files-placed)
    - [Header icon broken / missing / default](#header-icon-broken--missing--default)
    - [Usage in tmux session](#usage-in-tmux-session)

<br />

---

<br />

# About

Toasted Notifier allows you to send cross platform native notifications using Node.js, and works well with Electron.

<br />

This node package `toasted-notifier` contains a combination of supported notification vendors, which allows a user on any operating system to use this package in their application. The following list shows all of the notification vendors this package supports, which operating system it is for, and the filename for where the code belonging to that notification system can be found in this package:

| Notification API | Operating System | File | View Docs |
| --- | --- | --- | --- |
| **WindowToaster** | `Windows 8, 10, and 11` | `notifiers\toaster.js` | [view](#windowstoaster) |
| **WindowsBalloon** | `Windows XP / 7` | `notifiers\balloon.js` | [view](#windowsballoon) |
| **NotifySend** | `Linux` | `notifiers\notifysend.js` | [view](#notifysend) |
| **NotificationCenter** | `macOS / OS X` | `notifiers\notificationcenter.js` | [view](#notificationcenter) |
| **Growl** | `macOS / OS X`, `Windows` | `notifiers\growl.js` | [view](#growl) |

<br />

When you include `toasted-notifier` in your node project, the API will automatically detect what operating system you are running your application on. Depending on the operating system, Toasted Notifier will call the correct notification package that it will use to show your coded notifications. The following outlines how the package acts and what it takes into consideration:

- [NotificationCenter](#notificationcenter): macOS
  - This package will be used if you are running on macOS >= 10.8 or newer.
  - If running on an older version of macOS, [Growl](#growl) will be used instead.
- [NotifySend](#notifysend): Linux / Unix
  - Notifications will be shown using `notify-osd` or `libnotify-bin`; which must be installed on your Linux system.
  - Ubuntu should have one of these packages by default
- [WindowToaster](#windowstoaster): Microsoft Windows 8, 9, 10, 11+
- [WindowsBalloon](#windowsballoon): Windows XP, 7
  - [Growl](#growl) as fallback if Windows Balloon notifications cannot be called
  - [Growl](#growl) takes precedence over [Windows balloons](#windowsballoon)
- [Growl](#growl): macOS, Windows
  - This notification system is called if none of the requirements for the other notification vendors are met

<br />

## What is ntfy-toast

[ntfy-toast](https://github.com/Aetherinox/ntfy-toast) is a package included in this repo, which services notifications for users running Windows 8 - 11.

It is based on [SnoreToast](https://github.com/KDE/snoretoast), but has been updated with numerous features.

<br />

---

<br />

# Features

- Notification support for Windows XP - 11, Linux, and MacOS.
- Windows custom appID support for branding
- Persistent notifications keep a message on-screen until the user dismisses it
- No change in code if coming over from [node-notifier](https://github.com/mikaelbr/node-notifier)
- Customize sounds and icons

<br />

---

<br />

# Install

Simply install it using:

```shell
npm install --save toasted-notifier
```

<br />

---

<br />

# Usage

Example code for implementing notifications:

<br />

## Cross-Platform Advanced Usage

This format can be used for all notification vendors _(Windows, Linux, Mac)_

```javascript
const toasted = require('toasted-notifier');
const path = require('path');

toasted.notify(
    {
        title: 'Notification Title',
        message: 'This is a message',
        icon: path.join(__dirname, 'example_1.png'),    // Absolute path (doesn't work on balloons)
        sound: true,                                    // Only Notification Center or Windows Toasters
        wait: true                                      // Wait on callback until user interacts, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    },

    function (err, response, metadata) {
        // Response is response from notification
        // Metadata contains activationType, activationAt, deliveredAt
    }
);

toasted.on('click', function (obj, options, event) {
    // Triggers if `wait: true` and user clicks notification
});

toasted.on('timeout', function (obj, options) {
    // Triggers if `wait: true` and notification closes
});
```

<br />

## Fine-grained Control

If you want super fine-grained control for each reporter; you can call them individually. This allows you to tune specific options for the different vendors.

See below for documentation on each reporter.
```javascript
const NotificationCenter = require('toasted-notifier/notifiers/notificationcenter');
new NotificationCenter(options).notify();

const NotifySend = require('toasted-notifier/notifiers/notifysend');
new NotifySend(options).notify();

const WindowsToaster = require('toasted-notifier/notifiers/toaster');
new WindowsToaster(options).notify();

const Growl = require('toasted-notifier/notifiers/growl');
new Growl(options).notify();

const WindowsBalloon = require('toasted-notifier/notifiers/balloon');
new WindowsBalloon(options).notify();
```

<br />

If you're using several reporters:

```javascript
// NOTE: Technically, this takes longer to require
const tn = require('toasted-notifier');

new tn.NotificationCenter(options).notify();
new tn.NotifySend(options).notify();
new tn.WindowsToaster(options).notify(options);
new tn.WindowsBalloon(options).notify(options);
new tn.Growl(options).notify(options);
```

<br />

## Specific Vendor Documentation

To see information about each specific vendor and operating system, select one below:

---

The following different types of notifications are listed below:

| Notification API | Operating System | File | View Docs |
| --- | --- | --- | --- |
| **WindowToaster** | `Windows 8, 10, and 11` | `notifiers\toaster.js` | [view](#windowstoaster) |
| **WindowsBalloon** | `Windows XP / 7` | `notifiers\balloon.js` | [view](#windowsballoon) |
| **NotifySend** | `Linux` | `notifiers\notifysend.js` | [view](#notifysend) |
| **NotificationCenter** | `macOS / OS X` | `notifiers\notificationcenter.js` | [view](#notificationcenter) |
| **Growl** | `macOS / OS X` | `notifiers\growl.js` | [view](#growl) |

---

<br />

### NotificationCenter

- A Node.js wrapper for terminal-notify (with fallback).
- Code available at: `node_modules\toasted-notifier\notifiers\notificationcenter.js`
- Requires macOS version 10.8 or higher; otherwise the fallback is [Growl](#growl). If growl is not installed, an error will be returned in the callback.

<br />

Since `toasted-notifier` wraps around `terminal-notifier`, you can do anything terminal-notifier can by passing properties to the method.

- if `terminal-notifier` says `-message`, you can do `{message: 'Foo'}`
- if `terminal-notifier` says `-list ALL`, you can do `{list: 'ALL'}`

<br />

Notification is the primary focus of this module, so listing and activating do work, but they aren't documented.

<br />

```javascript
const NotificationCenter = require('toasted-notifier').NotificationCenter;

const toasted = new NotificationCenter({
    withFallback: false,        // Use Growl Fallback if <= 10.8
    customPath: undefined       // Relative/Absolute path to binary if you want to use your own fork of terminal-notifier
});

toasted.notify(
    {
        title: undefined,
        subtitle: undefined,
        message: undefined,
        sound: false,               // Case Sensitive string for location of sound file, or use one of macOS' native sounds (see below)
        icon: 'Terminal Icon',      // Absolute Path to Triggering Icon
        contentImage: undefined,    // Absolute Path to Attached Image (Content Image)
        open: undefined,            // URL to open on Click
        wait: false,                // Wait for User Action against Notification or times out. Same as timeout = 5 seconds

        // New in latest version. See `example/macInput.js` for usage
        timeout: 5,                 // Takes precedence over wait if both are defined.
        closeLabel: undefined,      // String. Label for cancel button
        actions: undefined,         // String | Array<String>. Action label or list of labels in case of dropdown
        dropdownLabel: undefined,   // String. Label to be used if multiple actions
        reply: false                // Boolean. If notification should take input. Value passed as third argument in callback and event emitter.
    },
    function (error, response, metadata) {
        console.log(response, metadata);
    }
);
```

<br />

> [!NOTE]
> The wait option is shorthand for `timeout: 5`. This just sets a timeout for 5 seconds. It does not make the notification stick until the user interacts with it.
> 
> **macOS Notifications**: `icon`, `contentImage`, and all forms of `reply`/`actions` require macOS 10.9.

<br />

Default timeout is `10` to ensure that the application closes properly. To remove the timeout and have notifications instantly close _(does not support actions)_, set `timeout: false`. If you are using an `action:` declaration; it is recommended to set the timeout to a high value to ensure the user has time to respond to the notification.

> [!NOTE]
> **Exception**: If `reply: true` is defined, set timeout to a high value, or to nothing at all.

<br />

#### Sounds

When specifying a `sound`, you have the following options:
- Basso
- Blow
- Bottle
- Frog
- Funk
- Glass
- Hero
- Morse
- Ping
- Pop
- Purr
- Sosumi
- Submarine
- Tink

<br />

If `sound: true`, **Bottle** is the default sound.

<br />

---

<br />

**See Also:**

- [Example: specific Notification Centers](./example/advanced.js)
- [Example: input](./example/macInput.js).

<br />

---

<br />

#### Custom Path

`customPath` takes a string which can be either a relative or absolute path to the binary of your fork/custom version of terminal-notifier.

Example: `./vendor/mac.noindex/terminal-notifier.app/Contents/MacOS/terminal-notifier`

<br />

#### Spotlight

`terminal-notifier.app` is located in the `mac.noindex` folder to prevent Spotlight from indexing the app. You can find it in:
- `toasted-notifier\vendor\mac.noindex\terminal-notifier.app`

<br />

### WindowsToaster

- A Node.js wrapper for Windows 8, 10, and 11 notifications.
- Code available at: `node_modules\toasted-notifier\notifiers\toaster.js`

<br />

**Note:** There are limitations for images in native **Windows 8** notifications:

- Image must be a `PNG` image
- Image must be smaller than `1024×1024px`
- Image must be less than `200kb`
- Image must be specified using an `absolute path`

These limitations are due to the Toast notification system. A good tip is to use something like `path.join` or `path.delimiter` to keep your paths cross-platform.

<br />

#### Notifications Not Working
If you do not see notifications from Toasted-Notifier, click windows **Start** and locate:

<div align="center">

<img src="https://github.com/Aetherinox/toasted-notifier/assets/118329232/1ed99a6a-f122-42f6-beb7-9c355d6622e2" width="380px">

</div>

<br />

Locate `NtfyToast`, or your `customPath` / `appID` program in the list.

<sup>`Note`: <a href="https://github.com/Aetherinox/ntfy-toast">NtfyToast</a> is the library used by Toasted-Notifier for Windows notifications</sup>

<div align="center">

<img src="https://github.com/Aetherinox/toasted-notifier/assets/118329232/2616ea6e-cde0-4240-8797-e671869dbe83" width="380px">

</div>

<br />

Enable both permissions for `banner` and `sound`:

<div align="center">

<img src="https://github.com/Aetherinox/toasted-notifier/assets/118329232/4d91a948-2231-4652-ba58-8547bd7ce48d" width="380px">

</div>

</div>

#### Windows 10 Fall Creators Update (Version 1709):
This node package utilizes [ntfy-toast](https://github.com/Aetherinox/ntfy-toast) to display native Windows notifications.

<br />

By default when a notification is displayed, the application name at the top of the popup will be `NtfyToast`. The app has an app id which is fed into Toasted-Notifier which is how the notification system knows what application name to show at the top of each notification. The app id is built into each application.

<br />

With the Fall Creators Update, Notifications on Windows 10 will only work as expected if a valid **appID** is specified. The appID must be exactly the same value that was registered during the installation of the app.

<br />

If you wish to have an alternative program name show at the top of each notification, you will need to feed your own app id into the code that calls your notification toasts.

<br />

For a in-depth write-up on how to get the app id for your custom program, read the section [appID support](#appid-support). 

<br />

You can attempt to quickly find the `appID` for an application by opening PowerShell and executing the command:

```powershell
get-StartApps | Where-Object {$_.Name -like '*YourAppName*'}
```

<br />

In our example, we can run
```powershell
get-StartApps | Where-Object {$_.Name -like '*Ntfytoast*'}
```

<br />

Which returns the following:
```console
Name          AppID
----          -----
ntfytoast     com.ntfytoast.id
```

<br />

You can also find the ID of your App by searching the registry for the appID you specified at installation of your app. For example: If you use the squirrel framework, your appID would be `com.squirrel.your.app`.

<br />

Once you have found the custom app id you wish to use for notifications; you can provide it when calling a notification, such as with the example below, in which we use `com.ntfytoast.id`:

<br />

```javascript
const WindowsToaster = require('toasted-notifier').WindowsToaster;

const toasted = new WindowsToaster({
    withFallback: false,            // Fallback to Growl or Balloons
    customPath: undefined           // Relative/Absolute path if you want to use your fork of SnoreToast.exe
});

toasted.notify(
    {
        title: undefined,           // String           | Required
        message: undefined,         // String           | Required if remove is not defined
        icon: undefined,            // String           | Absolute path to Icon
        sound: false,               // Bool or String   | (as defined by http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx)
        id: undefined,              // Number           | ID to use for closing notification.
        appID: 'com.ntfytoast.id',  // String           | App.ID and app Name. Defaults to no value, causing SnoreToast text to be visible.
        remove: undefined,          // Number           | Refer to previously created notification to close.
        install: undefined          // String           | <path, application, app id> |  Creates a shortcut <path> in the start menu which point to the executable <application>, appID used for the notifications.
    },
    function (error, response) {
        console.log(response);
    }
);
```

<br />

As stated before, there is a very in-depth write-up on how to set up your custom application and how to obtain the app id by reading the section [appID support](#appid-support).

<br />

### Growl
- A Node.js wrapper for MacOS, also used as a fallback.
- Code available at: `node_modules\toasted-notifier\notifiers\growl.js`
- [View Growl Github Repo](https://github.com/theabraham/growly/)

<br />

```javascript
const Growl = require('toasted-notifier').Growl;

const toasted = new Growl({
    name: 'Growl Name Used', // Defaults to 'Node'
    host: 'localhost',
    port: 23053
});

toasted.notify({
    title: 'Foo',
    message: 'My Message',
    icon: fs.readFileSync(__dirname + '/example_1.png'),
    wait: true,                     // whether or not to sticky the notification (defaults to false.)
    label: undefined,               // type of notification to use (defaults to the first registered notification type.)
    priority: undefined             // the priority of the notification from lowest (-2) to highest (2).
});
```

<br />

### WindowsBalloon

- A Node.js wrapper for earlier versions of Windows such as Windows XP / 7.
- Code available at: `node_modules\toasted-notifier\notifiers\balloon.js`
- Uses the 3rd party library Notifu, located at: `node_modules\toasted-notifier\vendor\notifu`
  - [View Notifu Project](https://www.paralint.com/projects/notifu/)

<br />

```javascript
const WindowsBalloon = require('toasted-notifier').WindowsBalloon;

const toasted = new WindowsBalloon({
  withFallback: false,      // Try Windows Toast and Growl first?
  customPath: undefined     // Relative/Absolute path if you want to use your fork of notifu
});

toasted.notify(
    {
        title: undefined,
        message: undefined,
        sound: false,       // true | false.
        time: 5000,         // How long to show balloon in ms
        wait: false,        // Wait for User Action against Notification
        type: 'info'        // The notification type : info | warn | error
    },
    function (error, response) {
        console.log(response);
    }
);
```

<br />

### NotifySend
- A Node.js wrapper for sending notifications to users on Linux
- Code available at: `node_modules\toasted-notifier\notifiers\notifysend.js`

<br />

> [!NOTE]
> notify-send doesn't support the `wait` flag.
> See flags and options on the man page [notify-send](https://manpages.ubuntu.com/manpages/oracular/en/man1/notify-send.1.html)

<br />

```javascript
const NotifySend = require('toasted-notifier').NotifySend;

const toasted = new NotifySend();

toasted.notify(
    {
        title: 'A Title',
        message: 'Hello to you',
        icon: __dirname + '/example_1.png',

        wait: false,        // Defaults no expire time set. If true expire time of 5 seconds is used. not supported by Windows Toasters
        timeout: 10,        // Alias for expire-time, time etc. Time before notify-send expires. Defaults to 10 seconds.

        // other notify-send flags:
        'app-name': 'toasted-notifier',
        urgency: undefined,
        category: undefined,
        hint: undefined
    }
);
```

<br />

---

<br />

## appID support
Windows Toast notifications will show the name of the application calling the notification at the top of each popup. Out-of-box, the application name will be NtfyToast.

With the `Windows Fall Creators Update`, you may modify the application name notifications on Windows 10 / 11 by supplying an `appID` to your notification javascript code. The appID must be the id assigned to the executable you wish to define that will show for the name at the top of the notification.

If you wish to brand notifications with your own application name, then there are a few steps you must complete.

<br />

### Create App Shortcut
You must create a windows shortcut (.lnk) within your windows Start Menu. This is a requirement by Microsoft.

The package used by Toasted Notifier for Windows 10 & 11 notifications (ntfy-toast); includes a command which will help you create the shortcut link automatically. To do this, open Command Prompt and run the command:

```shell
X:\path\to\node\project\node_modules\toasted-notifier\vendor\ntfyToast\ntfytoast.exe -install "MyApp\MyApp.lnk" "C:\path\to\myApp.exe" "My.APP_ID"
```

<br />

| Argument | Description |
| --- | --- |
| `"MyApp\MyApp.lnk"` | Where the lnk shortcut will be placed.  <br /> <br /> `C:\Users\USER\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\MyApp\MyApp.lnk` |
| `"C:\path\to\myApp.exe"` | Path to the executable you want to show the name for at the top of notifications |
| `"My.APP_ID"` | Your .exe app id |

<br />

To get the appID for the application you want to use, you can open Powershell and run the command:

```powershell
get-StartApps | Where-Object {$_.Name -like '*YourAppName*'}
```

<br />

In our example, we can run
```powershell
get-StartApps | Where-Object {$_.Name -like '*Ntfytoast*'}
```

<br />

Which returns the following:
```console
Name          AppID
----          -----
ntfytoast     com.ntfytoast.id
```

<br />

This means that if I wanted to use NtfyToast as the app which sends notifications, my final command would be:

```
X:\path\to\node\project\node_modules\toasted-notifier\vendor\ntfyToast\ntfytoast.exe -install "Ntfytoast\Ntfytoast.lnk" "C:\path\to\ntfytoast.exe" "com.ntfytoast.id"
```

<br />

When the `.lnk` is created, it will be placed in:
```
C:\Users\USER\AppData\Roaming\Microsoft\Windows\Start Menu\Programs
```

<br />

<div align="center">

<img src="https://github.com/Aetherinox/ntfy-toast/assets/118329232/ea9da9f3-4c8c-4fe5-9714-d4e83901f301" width="380px">

</div>

<br />

### Call App
Now that you have your app shortcut created, you can simply call the app every time you want to send a notification using `appID`. Remember to use your own app's id.

```javascript
const WindowsToaster = require('toasted-notifier').WindowsToaster;

const toasted = new WindowsToaster({
    withFallback: false,            // Fallback to Growl or Balloons?
    customPath: undefined           // Relative/Absolute path if you want to use your fork of SnoreToast.exe
});

toasted.notify(
    {
        title: undefined,               // String           | Required
        message: undefined,             // String           | Required if remove is not defined
        icon: undefined,                // String           | Absolute path to Icon
        sound: false,                   // Bool or String   | (as defined by http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx)
        id: undefined,                  // Number           | ID to use for closing notification.
        appID: 'com.ntfytoast.id',      // String           | App.ID and app Name. Defaults to no value, causing SnoreToast text to be visible.
        remove: undefined,              // Number           | Refer to previously created notification to close.
        install: undefined              // String           | <path, application, app id> |  Creates a shortcut <path> in the start menu which point to the executable <application>, appID used for the notifications.
    },
    function (error, response) {
        console.log(response);
    }
);
```

<br />

With the above code, we have specified an `appID` on the following line:
```javascript
    appID: 'com.ntfytoast.id',
```

<br />

---

<br />

## Help
### How to change text `NtfyToast` at the top of notifications
In order to change the text `NtfyToast`, you must supply an `-appID`. Windows Toast notifications require that you provide an application id for a valid Windows application before Windows will allow you to link another program.

For instructions on accomplishing this, read the section [appID support](#appid-support)

<br />

### Can't use Windows Toast notifications in WSL2
Ntfy makes use of a 3rd party package for Windows notifications to work. You must change the permissions on the Ntfy vendor .exe in order for it to work properly.

```shell
chmod +x node_modules/toasted-notifier/vendor/ntfyToast/ntfytoast.exe
```

<br />

You can add a `postinstall` action in the `package.json`:
```yml
 "scripts": {
    "postinstall": "chmod +x node_modules/toasted-notifier/vendor/ntfyToast/ntfytoast.exe
  }
```

<br />

### Distributing with Electron
If you package your Electron based app as an asar; toasted-notifier will fail to load. This is because of how a asar package works. You cannot execute a binary from within an asar package. 

Is solution is that when packaging the app into an asar, make sure you `--unpack` the `vendor/` folder of toasted-notifier so that the module still has access to the notification vendor binaries.

You can do so with the following command:
```shell
asar pack . app.asar --unpack "./node_modules/toasted-notifier/vendor/**"
```

<br />

Or if you use electron-builder without using asar directly; append build object to your `package.json` as below:

```
...
build: {
  asarUnpack: [
    './node_modules/toasted-notifier/**/*',
  ]
},
...
```

<br />

### Using Webpack
When using toasted-notifier inside of webpack, you must add the snippet below to your `webpack.config.js`.

```javascript
node: {
  __filename: true,
  __dirname: true
}
```

This is necessary because toasted-notifier loads the notifiers from a binary, and needs a relative file path. When webpack compiles the modules, it suppresses file directories, causing toasted-notifier to error on certain platforms.

<br />

### Windows: Where are files / .lnk files placed
In order for you to make your own custom application name appear at the top of a notification, you must create a `.lnk` in your Windows start menu. More about this is outlined in the section [AppID Support](#appid-support)

<br />

If you need to delete any of the generated `.lnk` files, you can find them in the following locations:
- `C:\ProgramData\Microsoft\Windows\Start Menu\Programs`
- `C:\Users\YOURUSERNAME\AppData\Roaming\Microsoft\Windows\Start Menu\Programs`

<br />

Toasted-notifier will also cache `logo.png` in:
- `C:\Users\YOURUSERNAME\AppData\Local\Temp\ntfytoast`

<br />

Delete any folders named `NtfyToast`, or whatever your custom app name is.

<br />

### Header icon broken / missing / default
If you show a notification and notice that the far top-left icon next to the app name is either missing or is showing a default application icon, you may need to clear your start menu `.lnk` file.

<br />

Go to the following folders, and delete the `NtfyToast/` folder. 
- `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\NtfyToast\`
- `C:\Users\YOURUSERNAME\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\NtfyToast\`

<br />

If you are using a custom application, search for the app name as a folder, and delete that folder.

<br />

### Usage in tmux session
When using toasted-notifier within a tmux session, it can cause the system to abruptly hang. To solve this issue:

- Upgrade **tmux** from `1.9a` to `2.0` with `brew update && brew upgrade tmux`
- Install **reattach-to-user-namespace** with `brew update && brew install reattach-to-user-namespace`
- Open `~/.tmux.conf` and add the following lines:
    ```
    # Reattach each new window to the user bootstrap namespace
    # https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard
    set -g default-command "which reattach-to-user-namespace > /dev/null && reattach-to-user-namespace -l $SHELL || $SHELL -l"
    ```

<br />

---

<br />


<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<br />
<br />

<!-- prettier-ignore-start -->
<!-- BADGE > GENERAL -->
[link-general-npm]: https://npmjs.com
[link-general-nodejs]: https://nodejs.org
[link-npmtrends]: http://npmtrends.com/toasted-notifier

<!-- BADGE > VERSION > GITHUB -->
[badge-version-gh]: https://img.shields.io/github/v/tag/Aetherinox/toasted-notifier?logo=GitHub&label=Version&color=ba5225
[link-version-gh]: https://github.com/Aetherinox/toasted-notifier/releases

<!-- BADGE > VERSION > NPMJS -->
[badge-version-npm]: https://img.shields.io/npm/v/toasted-notifier?logo=npm&label=Version&color=ba5225
[link-version-npm]: https://npmjs.com/package/toasted-notifier

<!-- BADGE > LICENSE -->
[badge-license-mit]: https://img.shields.io/badge/MIT-FFF?logo=creativecommons&logoColor=FFFFFF&label=License&color=9d29a0
[link-license-mit]: https://github.com/Aetherinox/toasted-notifier/blob/main/LICENSE

<!-- BADGE > BUILD -->
[badge-build]: https://img.shields.io/github/actions/workflow/status/Aetherinox/toasted-notifier/npm-publish.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
[link-build]: https://github.com/Aetherinox/toasted-notifier/actions/workflows/npm-publish.yml

<!-- BADGE > DOWNLOAD COUNT -->
[badge-downloads-gh]: https://img.shields.io/github/downloads/Aetherinox/toasted-notifier/total?logo=github&logoColor=FFFFFF&label=Downloads&color=376892
[link-downloads-gh]: https://github.com/Aetherinox/toasted-notifier/releases
[badge-downloads-npm]: https://img.shields.io/npm/dw/%40aetherinox%2Ftoasted-notifier?logo=npm&&label=Downloads&color=376892
[link-downloads-npm]: https://npmjs.com/package/toasted-notifier

<!-- BADGE > DOWNLOAD SIZE -->
[badge-size-gh]: https://img.shields.io/github/repo-size/Aetherinox/toasted-notifier?logo=github&label=Size&color=59702a
[link-size-gh]: https://github.com/Aetherinox/toasted-notifier/releases
[badge-size-npm]: https://img.shields.io/npm/unpacked-size/toasted-notifier/latest?logo=npm&label=Size&color=59702a
[link-size-npm]: https://npmjs.com/package/toasted-notifier

<!-- BADGE > COVERAGE -->
[badge-coverage]: https://img.shields.io/codecov/c/github/Aetherinox/toasted-notifier?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
[link-coverage]: https://codecov.io/github/Aetherinox/toasted-notifier

<!-- BADGE > ALL CONTRIBUTORS -->
[badge-all-contributors]: https://img.shields.io/github/all-contributors/Aetherinox/toasted-notifier?logo=contributorcovenant&color=de1f6f&label=contributors
[link-all-contributors]: https://github.com/all-contributors/all-contributors
[badge-tests]: https://img.shields.io/github/actions/workflow/status/Aetherinox/toasted-notifier/npm-tests.yml?logo=github&label=Tests&color=2c6488
[link-tests]: https://github.com/Aetherinox/toasted-notifier/actions/workflows/tests.yml
[badge-commit]: https://img.shields.io/github/last-commit/Aetherinox/toasted-notifier?logo=conventionalcommits&logoColor=FFFFFF&label=Last%20Commit&color=313131
[link-commit]: https://github.com/Aetherinox/toasted-notifier/commits/main/
<!-- prettier-ignore-end -->

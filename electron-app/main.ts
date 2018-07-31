import {
    app,
    BrowserWindow,
    Tray,
    shell,
    ipcMain
}  from 'electron';
import * as path from 'path';
import * as url from 'url';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let willExitApp = false;
// let trayWindow;
// let trayMenu;
// let trayIconPath = path.join(__dirname, '../images/trayIcon.png');
// let trayVisibility = false;

const createWindow = () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 770,
        height: 630,
        center: true,
        minWidth: 770,
        minHeight: 630
    });

    // and load the index.html of the app.
    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, '../app/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    win.loadURL('http://localhost:4200');

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    win.on('close', (e) => {
        if (!willExitApp) {
            e.preventDefault();
            win.hide();
        }
    });
};

const createTrayWindow = () => {
    // let tray = new Tray(trayIconPath);
    // // width: 450,
    // //     height: 100,
    // trayWindow = new BrowserWindow({
    //     width: 450,
    //     height: 800,
    //     show: true, // TODO: Change the show attr to false
    //     frame: false,
    //     fullscreenable: false,
    //     minimizable: false,
    //     resizable: false,
    //     movable: false,
    //     'node-integration': false
    // });
    // trayWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, '../tray/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // trayWindow.webContents.openDevTools();

    // trayWindow.on('blur', function () {
    //     toggleTrayWindow();
    // });

    // const position = getTrayWindowPosition();
    // trayWindow.setPosition(position.x, position.y, true);
    // tray.on('click', function (event) {
    //     toggleTrayWindow();
    // });
};

const toggleTrayWindow = () => {
    // if (trayVisibility) {
    //     trayWindow.hide();
    //     trayVisibility = false;
    // } else {
    //     trayWindow.show();
    //     trayVisibility = true;
    // }
};

const getTrayWindowPosition = () => {
    // const windowBounds = trayWindow.getBounds();
    // const trayBounds = tray.getBounds();

    // // Center window horizontally below the tray icon
    // const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

    // return {x: x, y: 0}
};


ipcMain.on('close_app', () => {
    app.quit();
});
ipcMain.on('open_website', () => {
    shell.openExternal('https://app.pendulums.io');
});
ipcMain.on('open_app', () => {
    win.show();
});

ipcMain.on('current_activity_changed', (event, arg) => {
    communicateWithTray('current_activity_changed', arg);
});
ipcMain.on('user_logged_in', (event, arg) => {
    communicateWithTray('user_logged_in', arg);
});
ipcMain.on('projects_changes', (event, arg) => {
    communicateWithTray('projects_changes', arg);
});

ipcMain.on('playOrStop', () => {
    win.webContents.send('playOrStop');
});

const communicateWithTray = (channelName, data) => {
    // if (trayWindow) {
    //     trayWindow.webContents.send(channelName, data);
    // }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    // createTrayWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/* 'before-quit' is emitted when Electron receives
 * the signal to exit and wants to start closing windows */
app.on('before-quit', () => willExitApp = true);

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    } else {
        win.show();
    }
});

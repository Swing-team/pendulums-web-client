import {
    app,
    BrowserWindow,
    Tray,
    shell,
    Menu,
    ipcMain,
    protocol
}  from 'electron';
// import * as menubar from 'menubar';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as Positioner from 'electron-positioner';


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let willExitApp = false;
let tray;
let trayWindow;
let trayIconPath;

if (process.platform === 'win32') {
    trayIconPath = path.join(__dirname, '../images/tray/tray.ico');
} else {
    trayIconPath = path.join(__dirname, '../images/tray/tray.png');
}

let trayVisibility = false;
// let mb;

// const createMenubar = () => {
//   this.tray = new Tray(trayIconPath);
//   this.mb = menubar({
//     dir: __dirname,
//     tooltip: 'Pendulums',
//     icon: __dirname + '../images/tray-image.png',
//     width: 300,
//     height: 140,
//     resizable: false,
//     alwaysOnTop : true,
//     tray: this.tray
//   });
//   this.mb.on('after-create-window', () => {
//     this.mb.window.loadURL(url.format({
//       pathname: path.join(__dirname, '../tray/tray.html'),
//       protocol: 'file:',
//       slashes: true
//     }));
//   });
//   this.mb.on('focus-lost', () => {
//     this.mb.window.hide()
//   });
// };

const createWindow = () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 770,
        height: 630,
        center: true,
        minWidth: 770,
        minHeight: 630
    });

    protocol.registerBufferProtocol('pendulums', (request, callback) => {
      callback({ mimeType: 'text/html', data: fs.readFileSync(path.join(__dirname, URL[1])) });
  }, (error) => {
      if (error) {
          console.error('Failed to register protocol');
      }
    });
  


    // and load the index.html of the app.
    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, './app/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    win.loadURL('http://localhost:4200');

    win.webContents.openDevTools();

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
  this.tray = new Tray(trayIconPath);
  // initialTrayMenu();
  // width: 450,
  // height: 100,
  this.trayWindow = new BrowserWindow({
    width: 300,
    height: 140,
    show: true, // TODO: Change the show attr to false
    frame: false,
    fullscreenable: false,
    minimizable: false,
    resizable: false,
    movable: false,
    // 'node-integration': false
  });

  const positioner = new Positioner(this.trayWindow);  
  const position = positioner.calculate('trayCenter', this.tray.getBounds()); 

  this.trayWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../tray/tray.html'),
    protocol: 'file:',
    slashes: true
  }));

  this.trayWindow.webContents.openDevTools();


  // this.trayWindow.on('blur', () => {
  //   toggleTrayWindow();
  // });


  // const position = getTrayWindowPosition();
  this.trayWindow.setPosition(position.x, position.y, true);

  this.tray.on('click', () => {
    toggleTrayWindow();
  });
};

const toggleTrayWindow = () => {
  if (this.trayVisibility) {
    this.trayWindow.hide();
    this.trayVisibility = false;
  } else {
    this.trayWindow.show();
    this.trayVisibility = true;
  }
};

// const getTrayWindowPosition = () => {
//   const windowBounds = this.trayWindow.getBounds();
//   const trayBounds = this.tray.getBounds();

//   // Center window horizontally below the tray icon
//   const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

//   // Position window 4 pixels vertically below the tray icon
//   const y = Math.round(trayBounds.y + trayBounds.height + 3);

//   return {x: x , y: y}
// };


// ipcMain.on('close_app', () => {
//     app.quit();
// });
// ipcMain.on('open_website', () => {
//     shell.openExternal('https://app.pendulums.io');
// });
// ipcMain.on('open_app', () => {
//     win.show();
// });
//
// ipcMain.on('current_activity_changed', (event, arg) => {
//     communicateWithTray('current_activity_changed', arg);
// });
// ipcMain.on('user_logged_in', (event, arg) => {
//     communicateWithTray('user_logged_in', arg);
// });
// ipcMain.on('projects_changes', (event, arg) => {
//     communicateWithTray('projects_changes', arg);
// });
//

ipcMain.on('startOrStop', (event, message) => {
  win.webContents.send('startOrStop', message);
});

// const communicateWithTray = (channelName, data) => {
//   this.trayWindow.webContents.send(channelName, data);
// };

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  createTrayWindow();
  // createMenubar();
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
        this.win.show();
    }
});

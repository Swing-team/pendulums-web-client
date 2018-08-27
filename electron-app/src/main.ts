import {
    app,
    BrowserWindow,
    Tray,
    shell,
    Menu,
    ipcMain,
    protocol,
    MenuItemConstructorOptions
}  from 'electron';
import * as express from 'express';
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
let trayVisibility = false;
let trayIconPath;
let activeTrayIconPath;

if (process.platform === 'win32') {
    trayIconPath = path.join(__dirname, '../build/tray.ico');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello.ico');
} else {
    trayIconPath = path.join(__dirname, '../build/tray.png');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello.png');
}

const createWindow = () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 920,
        height: 630,
        center: true,
        minWidth: 770,
        minHeight: 630
    });

    win.loadURL('http://localhost:5000/');

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
  this.trayWindow = new BrowserWindow({
    width: 300,
    height: 140,
    show: false,
    frame: false,
    fullscreenable: false,
    minimizable: false,
    resizable: false,
    movable: false,
  });

  const positioner = new Positioner(this.trayWindow);
  const position = positioner.calculate('trayCenter', this.tray.getBounds());

  this.trayWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../tray/tray.html'),
    protocol: 'file:',
    slashes: true
  }));

  // this.trayWindow.webContents.openDevTools();


  this.trayWindow.on('blur', () => {
    toggleTrayWindow();
  });

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

const setupApplicationMenu = () => {
    const template: MenuItemConstructorOptions[] = [
        {
          label: 'Edit',
          submenu: [
            {
              role: 'undo'
            },
            {
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              role: 'cut'
            },
            {
              role: 'copy'
            },
            {
              role: 'paste'
            },
            {
              role: 'pasteandmatchstyle'
            },
            {
              role: 'delete'
            },
            {
              role: 'selectall'
            }
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              role: 'resetzoom'
            },
            {
              role: 'zoomin'
            },
            {
              role: 'zoomout'
            },
            {
              type: 'separator'
            },
            {
              role: 'togglefullscreen'
            },
            {
              type: 'separator'
            },
            {
                role: 'toggledevtools'
              },
          ]
        },
        {
          role: 'window',
          submenu: [
            {
              role: 'minimize'
            },
            {
              role: 'close'
            }
          ]
        },
        {
          role: 'help',
          submenu: [
            {
                label: 'Donate us',
                click () {
                    shell.openExternal('https://www.coinpayments.net/index.php?cmd=_donate&reset=1&merchant=d88653d' + 
                    'eee05911e2438e35ec41c865e&item_name=Give%20some%20love%20to%20Pendulums%20project&currency=USD&a' + 
                    'mountf=10.00000000&allow_amount=1&want_shipping=0&allow_extra=1&cstyle=grid2');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Report an Issues',
                click () {
                  shell.openExternal('https://github.com/Swing-team/pendulums-web-client/issues')
                }
              },
          ]
        }
      ]
    
    if (process.platform === 'darwin') {
        template.unshift({
            label: 'Pendulums',
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        });

        // template[1].submenu.push(
        //     {
        //         type: 'separator'
        //     },
        //     {
        //         label: 'Speech',
        //         submenu: [
        //             {
        //                 role: 'startspeaking'
        //             },
        //             {
        //                 role: 'stopspeaking'
        //             }
        //         ]
        //     }
        // );

        template[3].submenu = [
            {
                role: 'close'
            },
            {
                role: 'minimize'
            },
            {
                type: 'separator'
            },
            {
                role: 'front'
            }
        ]
    } else {
        template.unshift({
            label: 'File',
            submenu: [{
                role: 'quit'
            }]
        })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
};

ipcMain.on('tray-close-app', () => {
    app.quit();
});

ipcMain.on('tray-open-website', () => {
    shell.openExternal('https://app.pendulums.io');
});

ipcMain.on('tray-open-app', () => {
    win.show();
});

// ipcMain.on('current_activity_changed', (event, arg) => {
//     communicateWithTray('current_activity_changed', arg);
// });
// ipcMain.on('user_logged_in', (event, arg) => {
//     communicateWithTray('user_logged_in', arg);
// });

ipcMain.on('win-projects-ready', (event, arg) => {
  this.trayWindow.webContents.send('tray-projects-ready', arg);
});

ipcMain.on('win-selected-project-ready', (event, arg) => {
  this.trayWindow.webContents.send('tray-selected-project-ready', arg);
});

ipcMain.on('tray-project-selected', (event, message) => {
  win.webContents.send('win-project-selected', message);
});

ipcMain.on('win-user-ready', (event, arg) => {
  this.trayWindow.webContents.send('tray-user-ready', arg);
});

ipcMain.on('tray-start-or-stop', (event, message) => {
    if (!message.activity) {
        // User stopped current activity
        this.tray.setImage(activeTrayIconPath);
    } else {
        // User started a new activity
        this.tray.setImage(activeTrayIconPath);
    }
    win.webContents.send('win-start-or-stop', message);
});

ipcMain.on('win-currentActivity-ready', (event, message) => {
    if (message.startedAt) {
        // User has current activity
        this.tray.setImage(activeTrayIconPath);
    } else {
        // User doesn't have current activity
        this.tray.setImage(trayIconPath);
    }
    this.trayWindow.webContents.send('tray-currentActivity-ready', message);
});

ipcMain.on('tray-rename-activity', (event, message) => {
  win.webContents.send('win-rename-activity', message);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    setupApplicationMenu();
    const expressApp = express();
    expressApp.use('/', express.static(path.join(__dirname, '/../app/')));
    expressApp.listen(5000, () => {
    });
    createWindow();
    createTrayWindow();
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

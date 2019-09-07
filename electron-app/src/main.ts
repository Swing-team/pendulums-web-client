import {
    app,
    BrowserWindow,
    Tray,
    shell,
    Menu,
    ipcMain,
    screen,
    MenuItemConstructorOptions,
    MenuItem,
    Notification
}  from 'electron';
import * as path from 'path';
import * as url from 'url';


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let willExitApp = false;
let tray;
let trayWindow;
let trayIconPath;
let activeTrayIconPath;
let currentActivity = {
    createdAt: null,
    id: null,
    name: null,
    project: null,
    startedAt: null,
    stoppedAt: null,
    updatedAt: null,
    user: null
};
let projects = {};
let userLoggedIn = false;

if (process.platform === 'win32') {
    trayIconPath = path.join(__dirname, '../build/tray.ico');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello.ico');
} else if (process.platform === 'linux') {
    trayIconPath = path.join(__dirname, '../build/tray@2x.png');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello@2x.png');
} else {
    trayIconPath = path.join(__dirname, '../build/tray.png');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello.png');
}

const signedInTrayMenuTemplate: MenuItemConstructorOptions[] = [
    {
        label: 'Stop',
        click: () => {
            stopActivity();

        },
        id: 'stop',
        visible: false
    },
    {
        label: 'Rename Activity',
        click: () => {
            renameActivity();
        },
        id: 'rename',
        visible: false
    },
    {
        type: 'separator',
        id: 'top-sepatator'
    },
    {
        label: 'Start Activity',
        submenu: [],
        id: 'start',
        visible: true,
    },
    {
        type: 'separator'
    },
    {
        label: 'Open App',
        click: function () {
            openApp();
        }
    },
    {
        label: 'Open web',
        click: function () {
            openWeb();
        }
    },

    {
        label: 'Quit',
        click: function () {
            quitApp();
        }
    }
];

const signedOutTrayMenuTemplate: MenuItemConstructorOptions[] = [

    {
        label: 'Sign In / Sign Up',
        click: () => {
            openApp();
        },
        id: 'signInOrUp'
    },

    {
        type: 'separator'
    },
    {
        label: 'Open web',
        click: function () {
            openWeb();
        }
    },

    {
        label: 'Quit',
        click: function () {
            quitApp();
        }
    }
]

let trayMenu = Menu.buildFromTemplate(signedInTrayMenuTemplate);
let minimized = false; // see openApp() for more information

const createWindow = () => {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().size; // make windows size based on user resolutions

    win = new BrowserWindow({
        width: Math.ceil(55 * width / 100),
        height: Math.ceil(60 * height / 100),
        center: true,
        minWidth: 770,
        minHeight: 630,
        webPreferences: { nodeIntegration: true }
    });


    win.loadURL(url.format({
        pathname: path.join(__dirname, '../app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // win.loadURL('http://localhost:4200');
    // win.webContents.openDevTools();

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

    win.on('blur', () => {
        win.webContents.executeJavaScript('document.getElementsByName("activityNameInput").forEach(element => {element.blur()})');
    });

    // see openApp() for more information
    win.on('minimize', () => {
      minimized = true;
    });

    win.webContents.on('new-window', (e, URL) => {
      e.preventDefault();
      shell.openExternal(URL);
  })
};

const createTrayWindow = () => {
    tray = new Tray(trayIconPath);
    const screenBounds = screen.getPrimaryDisplay().bounds;
    const trayWindowWidth = 500;
    // set the x position to center of the screen
    const trayXPosition = {
        x : screenBounds.width / 2 - (trayWindowWidth / 2),
        y: 0
    }
    trayWindow = new BrowserWindow({
        width: 500,
        height: 90,
        show: false,
        frame: false,
        fullscreenable: false,
        minimizable: false,
        resizable: false,
        movable: false,
        webPreferences: { nodeIntegration: true }
    });

    trayWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../tray/tray.html'),
        protocol: 'file:',
        slashes: true
    }));

    // trayWindow.webContents.openDevTools();

    trayWindow.on('blur', () => {
        trayWindow.hide();
    });

    tray.on('click', () => {
        tray.popUpContextMenu();
    });

    tray.on('double-click', () => {
        openApp();
    });

    trayWindow.setPosition(trayXPosition.x, trayXPosition.y, true);

    tray.setContextMenu(trayMenu);
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
              role: 'pasteAndMatchStyle'
            },
            {
              role: 'delete'
            },
            {
              role: 'selectAll'
            }
          ]
        },
        {
          label: 'View',
          submenu: [
            {
              role: 'resetZoom'
            },
            {
              role: 'zoomIn'
            },
            {
              role: 'zoomOut'
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
                role: 'toggleDevTools'
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
                    shell.openExternal('https://pendulums.io/donation.html');
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
                    role: 'hideOthers'
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

const openWeb = () => {
    shell.openExternal('https://app.pendulums.io');
};

const openApp = () => {
    // this logic is related to the issue TG-493
    // so minimize doesn't actuaaly hide the window and win.restore() doesn't work correctly
    // so a created a boolean variable called minimized and when win.on('minimize') trigger
    // the value of minized turns to true so when the user clicks on open App in tray
    // face no bug. i even check the e.preventDefault and win.hide() whene win.on('minimize) triggers
    // but this action also hides the icon in menu bar. so by now this is the best option i could think of.

    if (minimized) {
      win.hide();
      minimized = false;
    }
    win.show();
};

const quitApp = () => {
    app.quit();
};

const startActivity = (id) => {
    const message = {
        activity: {
            name: projects[id].recentActivityName ? projects[id].recentActivityName : 'Untitled Activity',
            project: id,
            startedAt: new Date().getTime().toString()
        },
        project: projects[id]
    }
    win.webContents.send('win-start-or-stop', message);
    trayWindow.show();
};

const stopActivity = () => {
    trayMenu.getMenuItemById('stop').visible = false;
    tray.setContextMenu(trayMenu)
    const message = {
        activity: null,
        project: projects[currentActivity.project]
    }
    win.webContents.send('win-start-or-stop', message);
};

const renameActivity = () => {
    trayWindow.show();
};

ipcMain.on('win-user-ready', (event, user) => {
    if (user.id) {
        trayMenu = Menu.buildFromTemplate(signedInTrayMenuTemplate);
        userLoggedIn = true;
    } else {
        trayMenu = Menu.buildFromTemplate(signedOutTrayMenuTemplate);
        tray.setImage(trayIconPath);
        userLoggedIn = false;
    }
    tray.setContextMenu(trayMenu);
});

ipcMain.on('win-projects-ready', (event, arg) => {
    if (trayMenu.getMenuItemById('start') && userLoggedIn) {
        trayMenu.getMenuItemById('start')['submenu']['clear']();
        for (const project of arg) {
            projects[project.id] = project;
            trayMenu.getMenuItemById('start')['submenu'].append(new MenuItem({
                label: project.name,
                click: (menuItem) => {
                    startActivity(menuItem['id']);
                },
                id: project.id,
                enabled: !(currentActivity.project && currentActivity.project === project.id)
            }));
        }
        tray.setContextMenu(trayMenu);
    }
});

ipcMain.on('tray-rename-activity', (event, message) => {
    trayWindow.hide();
    win.webContents.send('win-rename-activity', {
        taskName: message.taskName,
        project: projects[message.project]
    });
});

ipcMain.on('win-currentActivity-ready', (event, message) => {
    if (userLoggedIn) {
        if (message.startedAt) {
            // User has current activity
            trayMenu.getMenuItemById('stop').visible = true;
            trayMenu.getMenuItemById('rename').visible = true;
            if (trayMenu.getMenuItemById('start')['submenu'].items.length !== 0) {
                trayMenu.getMenuItemById('start')['submenu'].getMenuItemById(message.project).enabled = false;
            }
            tray.setContextMenu(trayMenu)
            tray.setImage(activeTrayIconPath);
        } else {
            // User doesn't have current activity
            trayMenu.getMenuItemById('stop').visible = false;
            trayMenu.getMenuItemById('rename').visible = false;
            if (message.project) {
                trayMenu.getMenuItemById('start')['submenu'].getMenuItemById(message.project).enabled = true;
            } else if (currentActivity.project) {
                trayMenu.getMenuItemById('start')['submenu'].getMenuItemById(currentActivity.project).enabled = true;
            }
            tray.setContextMenu(trayMenu)
            tray.setImage(trayIconPath);
        }
        currentActivity = message;
        trayWindow.webContents.send('tray-currentActivity-ready', {
            currentActivity,
            projectName: currentActivity.project ? projects[currentActivity.project] : ''
        });
    }
});

ipcMain.on('trray-hide-tray-window', () => {
    trayWindow.hide();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window
        if (win) {
          if (win.isMinimized()) {
            win.restore();
          }
          if (win.isVisible) {
              win.restore();
          } else {
              win.show()
          }
        }
        return true;
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    setupApplicationMenu();
    createWindow();
    createTrayWindow();

    ipcMain.on('update-available', () => {
        console.log('update available')
        let notification = new Notification({
            title: 'Update available',
            body: 'Click to download new version'
        });
        notification.on('click', () => {
            shell.openExternal('https://pendulums.io')
        })
        notification.show();
    });
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

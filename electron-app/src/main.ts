import {
    app,
    BrowserWindow,
    Tray,
    shell,
    Menu,
    ipcMain,
    screen,
    MenuItemConstructorOptions,
    MenuItem
}  from 'electron';
import * as express from 'express';
import * as path from 'path';
import * as url from 'url';


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let willExitApp = false;
let tray;
let trayWindow;
let trayVisibility = false;
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

if (process.platform === 'win32') {
    trayIconPath = path.join(__dirname, '../build/tray.ico');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello.ico');
} else {
    trayIconPath = path.join(__dirname, '../build/tray.png');
    activeTrayIconPath = path.join(__dirname, '../build/tray-yello.png');
}

const trayMenuTemplate: MenuItemConstructorOptions[] = [
    {
        label: 'Stop',
        click: () => {
            stopActivity();
            
        },
        id: 'stop',
        visible: false
    },
    {
        label: 'Rename activity',
        click: () => {
            renameActivity();
        },
        id: 'rename',
        visible: false
    },
    {
        type: 'separator'
    },
    {
        label: 'Start activity',
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

const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);

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
    const screenBounds = screen.getPrimaryDisplay().bounds;
    // set the x position to center of the screen, 150 = trayWindow.width / 2
    const trayXPosition = {
        x : screenBounds.width / 2 - 150,
        y: 0
    }
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

    this.trayWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../tray/tray.html'),
        protocol: 'file:',
        slashes: true
    }));

    this.trayWindow.webContents.openDevTools();

    this.trayWindow.on('blur', () => {
        this.trayWindow.hide();
    });

    this.trayWindow.setPosition(trayXPosition.x, trayXPosition.y, true);

    this.tray.setContextMenu(trayMenu);
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

const openWeb = () => {
    shell.openExternal('https://app.pendulums.io');
};

const openApp = () => {
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
};

const stopActivity = () => {
    trayMenu.getMenuItemById('stop').visible = false;
    this.tray.setContextMenu(trayMenu)
    const message = {
        activity: null,
        project: projects[currentActivity.project]
    }
    win.webContents.send('win-start-or-stop', message);
};

const renameActivity = () => {
    this.trayWindow.show();
};
ipcMain.on('tray-close-app', () => {
    quitApp();
});

ipcMain.on('tray-open-website', () => {
    openWeb();
});

ipcMain.on('tray-open-app', () => {
    openApp();
});

ipcMain.on('win-projects-ready', (event, arg) => {
    trayMenu.getMenuItemById('start')['submenu'].clear();
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
    this.tray.setContextMenu(trayMenu);
    this.trayWindow.webContents.send('tray-projects-ready', arg);
});

ipcMain.on('win-selected-project-ready', (event, arg) => {
    this.trayWindow.webContents.send('tray-selected-project-ready', arg);
});

ipcMain.on('tray-project-selected', (event, message) => {
    win.webContents.send('win-project-selected', message);
});

ipcMain.on('tray-start-or-stop', (event, message) => {
    if (!message.activity) {
        // User stopped current activity
        this.tray.setImage(trayIconPath);
    } else {
        // User started a new activity
        trayMenu.getMenuItemById('stop').visible = true;
        this.tray.setImage(activeTrayIconPath);
    }
    win.webContents.send('win-start-or-stop', message);
});

ipcMain.on('tray-rename-activity', (event, message) => {
    win.webContents.send('win-rename-activity', {
        taskName: message.taskName,
        project: projects[message.project]
    });
});

ipcMain.on('win-currentActivity-ready', (event, message) => {
    if (message.startedAt) {
        // User has current activity
        trayMenu.getMenuItemById('stop').visible = true;
        trayMenu.getMenuItemById('rename').visible = true;
        console.log('user has current activity');
        if (trayMenu.getMenuItemById('start')['submenu'].items.length !== 0) {
            trayMenu.getMenuItemById('start')['submenu'].getMenuItemById(message.project).enabled = false;
        }
        this.tray.setContextMenu(trayMenu)
        this.tray.setImage(activeTrayIconPath);
    } else {
        // User doesn't have current activity
        if (!message.project && currentActivity.project) {
            trayMenu.getMenuItemById(currentActivity.project).enabled = true;
        }
        trayMenu.getMenuItemById('stop').visible = false;
        trayMenu.getMenuItemById('rename').visible = false;
        if (message.project) {
            trayMenu.getMenuItemById('start')['submenu'].getMenuItemById(message.project).enabled = true;
        } else if (currentActivity.project) {
            trayMenu.getMenuItemById('start')['submenu'].getMenuItemById(currentActivity.project).enabled = true;
        }
        this.tray.setContextMenu(trayMenu)
        this.tray.setImage(trayIconPath);
    }
    currentActivity = message;
    this.trayWindow.webContents.send('tray-currentActivity-ready', {
        currentActivity,
        projectName : currentActivity.project ? projects[currentActivity.project] : ''
    });
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

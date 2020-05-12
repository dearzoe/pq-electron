const serverConfig = require('./server.js');
const path = require('path');
const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain,
    clipboard,
    globalShortcut,
} = require('electron')
let server = serverConfig.server;
let win;

function createWindow () {
    // 创建浏览器窗口
    win = new BrowserWindow({
        title: ' ',
        width: 1200,
        minWidth: 1200,
        height: 900,
        minHeight: 600,
        backgroundColor: 'white', // 预加载一个白色背景
        icon: path.join(__dirname, './pq.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    })

    // 加载index.html文件
    win.loadFile('index.html')
    // 加载配Q页面
    win.loadURL(server, {'extraHeaders': 'pragma: no-cache\n'});
}

const menu = new Menu();
Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
    if (process.platform === "darwin") {
        let contents = mainWindow.webContents;
        globalShortcut.register("CommandOrControl+C", () => {
            contents.copy();
        });
        globalShortcut.register("CommandOrControl+V", () => {
            contents.paste();
        });
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on('browser-window-created', function(event, win) {
    win.webContents.on('context-menu', function(e, params) {
        menu.popup(win, params.x, params.y)
    })
})

app.on('ready', () => {
    globalShortcut.register('CmdOrCtrl+F12', () => {
        win.webContents.openDevTools()
    })
    menu.append(
        new MenuItem({
            label: '刷新',
            click: function() {
                win.reload()
            },
        }),
    )
    menu.append(
        new MenuItem({
            label: '复制',
            accelerator: "CmdOrCtrl+C",
            selector: "copy:",
        })
    )
    menu.append(
        new MenuItem({
            label: '粘贴',
            accelerator: "CmdOrCtrl+V",
            selector: "paste:",
        })
    )
});

ipcMain.on('show-context-menu', function(event) {
    const win = BrowserWindow.fromWebContents(event.sender)
    menu.popup(win)
})

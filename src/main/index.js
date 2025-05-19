import { app, shell, BrowserWindow, ipcMain, nativeImage, Menu, Tray, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'node:fs';

import CreateMCPServer from '../../src-mcpserver/dist/index.js';
import {
  getBrowser,
  getUserInfo,
  setSaveDataPath
} from '../../src-mcpserver/dist/xhs-browser.js';


// 配置管理
const configFilePath = join(app.getPath('userData'), 'config.json');
function loadConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，创建一个默认的配置文件
      const defaultConfig = { isTest: false };
      saveConfig(defaultConfig);
      return defaultConfig;
    } else {
      throw error;
    }
  }
}
function saveConfig(config) {
  const data = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFilePath, data, 'utf8');
}


// 全局变量
var mcpServer = null;
var mainWindow = null;
var tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 725,
    height: 550,
    maximizable: false,
    fullscreenable: false,
    // show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: is.dev,
    }
  });
  // 禁用菜单
  !is.dev && mainWindow.setMenu(null);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  });
  mainWindow.on('close', e => {
    e.preventDefault();
    mainWindow.hide();
    return false;
  });
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }


  // 创建托盘
  // 判断是不是mac系统
  let trayIcon = nativeImage.createFromPath(join(__dirname, '../../resources', 'tray', 'normal.png'));
  tray = new Tray(trayIcon);

  const trayMenu = Menu.buildFromTemplate([
    { label: '打开窗口', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: '退出程序', click: () => app.quit() },
  ]);
  tray.setContextMenu(trayMenu);
  setTrayTooltip();
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

// 托盘提示
const setTrayTooltip = (running = false) => {
  tray.setToolTip(`小红书MCP助手 [${running ? '运行中' : '未启动'}]`)
  setTrayIcon(running);
}
// 设置托盘图标
const setTrayIcon = (running = false) => {
  const IMG_END = process.platform.toLowerCase().includes('win') ? '@2x' : '';

  let trayIcon = nativeImage.createFromPath(join(__dirname, '../../resources', 'tray', `${running ? 'running' : 'normal'}${IMG_END}.png`));

  tray.setImage(trayIcon);
}
// 应用退出前处理
app.on('before-quit', () => {
  if (mcpServer && mcpServer.IsRunning) {
    mcpServer.stop();
  }
  process.exit(0);
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('mcp.aicu.icu')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  // ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow && mainWindow.show();
    }
  })
});

// ===== ipc ========

ipcMain.handle('start-mcpserver', async (event, arg) => {
  return new Promise((res, rej) => {
    // console.log('[start mcp server]', arg);
    if (mcpServer && mcpServer.IsRunning) {
      mcpServer.stop();
      mcpServer = null;
    }
    setSaveDataPath(arg['savePath']);
    mcpServer = CreateMCPServer(arg);
    mcpServer.start();
    getBrowser();
    if (mcpServer.IsRunning) {
      setTrayTooltip(true);
      return res('MCP服务启动成功');
    }
    res('MCP服务启动失败');
  })
});
ipcMain.handle('stop-mcpserver', async () => {
  return new Promise((res, rej) => {
    if (!mcpServer || !mcpServer.IsRunning) {
      return res('MCP服务未启动');
    }
    mcpServer.stop().then(() => {
      setTrayTooltip(false);
      res('MCP服务已关闭');
      mcpServer = null;
    }).catch(e => {
      res(`关闭失败：${e.message}`);
    })
  })
});

ipcMain.handle('get-mcpserver-tools', async () => {
  if (!mcpServer || !mcpServer.IsRunning) {
    return [];
  }
  const res = await mcpServer.toolLoader.loadTools();
  // create tools.json
  is.dev && fs.writeFileSync('./tools.json', JSON.stringify(res));
  return JSON.parse(
    JSON.stringify(res)
  );
});
ipcMain.handle('toggle-xhs-browser', async (event, arg) => {
  const browser = getBrowser();
  browser.show();
});
ipcMain.handle('get-xhs-userinfo', async (event, arg) => {
  return getUserInfo();
});
ipcMain.handle('select-save-path', async (event, arg) => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    message: '请选择数据导出目录'
  });
  if (!res.canceled) return res.filePaths[0];
  return '';
});

ipcMain.handle('get-download-path', async () => {
  return app.getPath('downloads');
});

import packageInfo from '../../package.json'
// 获取更新
ipcMain.handle('check-update', async () => {
  try {
    let update_url = packageInfo.updateurl;
    update_url += update_url.includes('?') ? '&' : '?';
    update_url += `ver=${packageInfo.version}&platform=${process.platform}&test=`;
    update_url += loadConfig().isTest ? '1' : '0';
    const data = await fetch(update_url).then(r => r.json());
    return data;
  } catch (e) {
    return {
      error: e.message
    }
  }
});
ipcMain.handle('set-joined-test', async(event, arg) => {
  // store.set('isTest', arg);
  const conf = loadConfig();
  conf['isTest'] = arg;
  saveConfig(conf);
});
ipcMain.handle('get-joined-test', async() => {
  return !!loadConfig().isTest;
});
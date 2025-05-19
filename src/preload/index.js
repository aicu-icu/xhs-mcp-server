import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  startMcpServer: async (opts) => {
    return ipcRenderer.invoke('start-mcpserver', opts);
  },
  stopMcpServer: async () => {
    return ipcRenderer.invoke('stop-mcpserver');
  },
  // 获取mcp工具列表
  getMcpServerTools: async () => {
    return ipcRenderer.invoke('get-mcpserver-tools');
  },
  toggleXhsBrowser: async () => {
    return ipcRenderer.invoke('toggle-xhs-browser');
  },
  getXhsUserInfo: async () => {
    return ipcRenderer.invoke('get-xhs-userinfo');
  },
  selectSavePath: async () => {
    return ipcRenderer.invoke('select-save-path');
  },
  // 获取系统的下载目录
  getDownloadPath: async () => {
    return ipcRenderer.invoke('get-download-path');
  },
  setJoinedTest: async(joined) => {
    return ipcRenderer.invoke('set-joined-test', joined);
  },
  // 获取是否加入测试
  getJoinedTest: async() => {
    return ipcRenderer.invoke('get-joined-test');
  },
  // 获取更新信息
  checkUpdate: async () => {
    return ipcRenderer.invoke('check-update');
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  console.log('exports..')
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('AppApi', api)
  } catch (error) {
    console.error(error)
  }
} else {
  console.log('global')
  // window.electron = electronAPI
  window.AppApi = api
}

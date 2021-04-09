const { contextBridge } = require('electron')
const { getCurrentWindow, Notification, app } = require('@electron/remote')

contextBridge.exposeInMainWorld('electron', {
  minimize: () => getCurrentWindow().minimize(),
  maximize: () => getCurrentWindow().maximize(),
  unmaximize: () => getCurrentWindow().unmaximize(),
  close: () => getCurrentWindow().close(),
  isMaximized: () => getCurrentWindow().isMaximized(),
  showNotification: options => new Notification(options).show(),
  isEmojiPanelSupported: () => app.isEmojiPanelSupported(),
  showEmojiPanel: () => app.showEmojiPanel()
})

/*
const reload = () => getCurrentWindow().reload()
const unregister = () => globalShortcut.unregister('CommandOrControl+R', reload)
const register = () => globalShortcut.register('CommandOrControl+R', reload) // or 'F5';
register()
window.addEventListener('focus', register)
window.addEventListener('blur', unregister)
window.addEventListener('beforeunload', unregister)
*/

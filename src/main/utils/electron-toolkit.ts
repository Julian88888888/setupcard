import { app, BrowserWindow } from 'electron'

/**
 * Minimal replacements for @electron-toolkit/utils so we don't need that package.
 * Provides app user-model id, platform helpers, and useful window shortcuts.
 */

export const is = {
  get dev(): boolean {
    return !app.isPackaged
  }
}

export const electronApp = {
  setAppUserModelId(id: string): void {
    if (process.platform === 'win32') {
      app.setAppUserModelId(id)
    }
  }
}

export const optimizer = {
  watchWindowShortcuts(window: BrowserWindow): void {
    window.webContents.on('before-input-event', (event, input) => {
      // F12 → toggle DevTools in development
      if (input.type === 'keyDown' && input.key === 'F12' && is.dev) {
        window.webContents.toggleDevTools()
        event.preventDefault()
      }
      // Block reload shortcuts in production
      if (
        input.type === 'keyDown' &&
        !is.dev &&
        ((input.control && input.key.toLowerCase() === 'r') ||
          (input.meta && input.key.toLowerCase() === 'r'))
      ) {
        event.preventDefault()
      }
    })
  }
}

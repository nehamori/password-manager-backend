const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('blinkpassElectron', {
    getLaunchProtocolUrl: () => ipcRenderer.invoke('blinkpass:get-launch-protocol-url'),
    onProtocolUrl: (callback) => {
        const listener = (_event, protocolUrl) => callback(protocolUrl);
        ipcRenderer.on('blinkpass:protocol-url', listener);

        return () => {
            ipcRenderer.removeListener('blinkpass:protocol-url', listener);
        };
    },
});

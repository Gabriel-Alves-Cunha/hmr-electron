import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("bridge", {
	sendIpc: ipcRenderer.send,
	listenIpc(
		channel: string,
		callBack: (event: IpcRendererEvent, arg: any) => void,
	) {
		ipcRenderer.on(channel, (event, arg) => {
			callBack(event, arg);
		});
	},
});

import { app, BrowserWindow } from "electron";
import path from "node:path";

import { add } from "./add.cjs";

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.cjs"),
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	console.log("1 + 1 =", add(1, 1));
	win.loadURL("http://localhost:5173").then();
	win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

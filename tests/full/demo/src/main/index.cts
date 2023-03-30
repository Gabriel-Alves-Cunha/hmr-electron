import { app, BrowserWindow } from "electron";
import { join } from "node:path";

import { add } from "./add.cjs";

function createWindow() {
	const win = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			preload: join(__dirname, "preload.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	console.log("1 + 1 =", add(1, 1));

	win.loadURL("http://localhost:5173").then();

	win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0)	createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

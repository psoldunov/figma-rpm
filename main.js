const { app, BrowserWindow, shell } = require('electron');

app.on('ready', () => {
	const win = new BrowserWindow({
		autoHideMenuBar: true,
		width: 1920,
		height: 1080,
		minWidth: 800,
		minHeight: 600,
	});

	// Handle all navigation events
	win.webContents.on('did-navigate', (event, url) => {
		if (url === 'https://www.figma.com/') {
			win.loadURL('https://www.figma.com/login');
		}
	});

	// Load the login page
	win.loadURL('https://www.figma.com/files');

	// Handle external links
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (!url.startsWith('https://www.figma.com/')) {
			shell.openExternal(url);
			return { action: 'deny' };
		}
		return { action: 'allow' };
	});
});

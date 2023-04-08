const { app, BrowserWindow, shell } = require('electron');
const Store = require('electron-store');

// Create a new instance of the electron-store module
const store = new Store();

app.on('ready', () => {
	let mainWindowBounds = store.get('windowBounds');
	if (!mainWindowBounds) {
		mainWindowBounds = {
			x: 0,
			y: 0,
			width: 1920,
			height: 1080,
		};
	}

	const win = new BrowserWindow({
		autoHideMenuBar: true,
		...mainWindowBounds,
		minWidth: 800,
		minHeight: 600,
	});

	// Load the login page
	win.loadURL('https://www.figma.com/files');

	// Handle all navigation events
	win.webContents.on('did-navigate', (event, url) => {
		if (url === 'https://www.figma.com/') {
			win.loadURL('https://www.figma.com/login');
		}
	});

	// Handle external links
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (!url.startsWith('https://www.figma.com/')) {
			shell.openExternal(url);
			return { action: 'deny' };
		}
		return { action: 'allow' };
	});

	// Save the window position and size when the window is moved or resized
	win.on('resize', () => {
		const bounds = win.getBounds();
		store.set('windowBounds', bounds);
	});

	win.on('move', () => {
		const bounds = win.getBounds();
		store.set('windowBounds', bounds);
	});
});

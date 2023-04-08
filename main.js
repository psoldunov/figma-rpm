const { app, BrowserWindow, shell, dialog } = require('electron');
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

	let storedURL = store.get('urlState');

	const win = new BrowserWindow({
		autoHideMenuBar: true,
		...mainWindowBounds,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			webSecurity: false,
		},
	});

	if (!storedURL) {
		storedURL = 'https://www.figma.com/files';
	}

	win.loadURL(storedURL);

	// Handle all navigation events
	win.webContents.on('did-navigate-in-page', (event, url) => {
		store.set('urlState', url);
	});

	win.webContents.on('will-navigate', (event, url) => {
		if (
			url === 'https://www.figma.com/' ||
			url === 'https://www.figma.com/?fuid='
		) {
			win.loadURL('https://www.figma.com/login');
			store.reset('urlState');
			return;
		}
		store.set('urlState', url);
	});

	// Handle file dialogs
	win.webContents.on('select-file', (event, filePath) => {
		dialog
			.showOpenDialog(win, {
				defaultPath: filePath,
				properties: ['openFile'],
				modal: true,
			})
			.then((result) => {
				if (result.canceled) {
					event.preventDefault();
					return;
				}
				event.preventDefault();
				win.webContents.send('file-selected', result.filePaths[0]);
			})
			.catch((err) => {
				console.error(err);
			});
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

	// Set the initial zoom level to 1.0
	win.webContents.setZoomFactor(1.0);

	// Listen for Ctrl + + and Ctrl + - to zoom in and out
	win.webContents.on('before-input-event', (event, input) => {
		if (input.control) {
			if (input.key === '=') {
				win.webContents.setZoomFactor(win.webContents.getZoomFactor() + 0.1);
				event.preventDefault();
			} else if (input.key === '-') {
				win.webContents.setZoomFactor(win.webContents.getZoomFactor() - 0.1);
				event.preventDefault();
			}
		}
	});
});

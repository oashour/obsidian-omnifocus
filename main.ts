import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, ButtonComponent, TextComponent } from 'obsidian';
import * as fs from 'fs';
//const applescript = require('applescript');
import * as applescript from 'applescript'


interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		// Tell the console what you're doing
		console.log('Loading OmniFocus Plugin');

		// Load settings
		await this.loadSettings();

		// Add ribbon icon that opens the modal to quick add tasks
		this.addRibbonIcon('check-in-circle', 'OmniFocus', () => {
			let leaf = this.app.workspace.activeLeaf;
			if (leaf) {
					new InboxModal(this.app).open();
				return true;
			}
			return false;
		});

		// Add a status bar item
		// this.addStatusBarItem().setText('Hello Mellow');

		// Add a comand to open the modal
		this.addCommand({
			// Can use this to extract the database of tags and projects from OF
			id: 'add-inbox-task',
			name: 'Add task to Inbox',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new InboxModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		// Add the settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	// What happens when you unload
	onunload() {
		console.log('Unloading OmniFocus plugin');
	}

	// Load settings function
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// Save settings function
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Modal to add tasks to inbox
class InboxModal extends Modal {
	// Construct?
	constructor(app: App) {
		super(app);
	}

	// What happens when you open it
	onOpen() {
		let {contentEl} = this;
		// Add text box to hold the task name
        let taskNameButton = new TextComponent(contentEl)
				.setPlaceholder("Task Name")
		// Button to add the tasks to OF
		let addTaskButton = new ButtonComponent(contentEl)
			.setButtonText('Submit')
			.setIcon("right-chevron-glyph")
			.setTooltip("Submit")
			// On Click callback
			.onClick(() => {
				// Add quotes so it can be used in AppleScript
				var taskName = "\"" + taskNameButton.getValue() + "\""
				var taskNote = "\"Added by Obsidian on \""
				const script = `set theDate to current date
								set theTask to ${taskName}
								set theNote to ${taskNote} & theDate
				
								tell application "OmniFocus"
									tell front document
										-- set theTag to first flattened tag where its name = "Office"
										-- set theProject to first flattened project where its name = "Lin2019"
										-- tell theProject to make new task with properties {name:theTask, note:theNote, primary tag:theTag}
										-- make new inbox task with properties {name:theTask, note:theNote, primary tag:theTag}
										make new inbox task with properties {name:theTask, note:theNote}
									end tell
								end tell`
				// for debugging
				console.log("This is the script for adding the task")
				console.log(script)
				// Execute apple script
				applescript.execString(script, (err: any, rtn: any) => {
							if (err) {
								// Something went wrong!
								console.log(err)
								// What Reason?
								new Notice("Error: Unable to create task for some reason")
							}
							else {
								// Clear task button to add more tasks
								taskNameButton.setValue("")
								taskNameButton.inputEl.focus()
							}
							if (Array.isArray(rtn)) {
								for (const value of rtn) {
									console.log(value);
								}
							}
							});
			})
    // Focus on the text field
    taskNameButton.inputEl.focus()
	}
	// What happens when you close the modal
	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'OmniFocus Settings'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
function runAppleScript(script: string){
}
import { setHandle, getHandle } from './utils/idb.js';

const selectSourceBtn = document.getElementById('selectSourceBtn');
const sourceStatus = document.getElementById('sourceStatus');
const selectOutputBtn = document.getElementById('selectOutputBtn');
const outputStatus = document.getElementById('outputStatus');

// Timing Inputs
const generationTimeoutInput = document.getElementById('generationTimeout');
const downloadTimeoutInput = document.getElementById('downloadTimeout');
const pageLoadTimeoutInput = document.getElementById('pageLoadTimeout');
const stepDelayInput = document.getElementById('stepDelay');
const taskIntervalInput = document.getElementById('taskInterval');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const saveStatus = document.getElementById('saveStatus');

// Retry Inputs
const maxRetriesInput = document.getElementById('maxRetries');
const retryDelayInput = document.getElementById('retryDelay');
const continueOnErrorInput = document.getElementById('continueOnError');
const saveRetryBtn = document.getElementById('saveRetryBtn');
const retrySaveStatus = document.getElementById('retrySaveStatus');

// Default Values
const DEFAULTS = {
    settings_generationTimeout: 300,
    settings_downloadTimeout: 120,
    settings_pageLoadTimeout: 30,
    settings_stepDelay: 1000,
    settings_taskInterval: 2000,
    settings_maxRetries: 3,
    settings_retryDelay: 5,
    settings_continueOnError: true
};

// Load saved settings
async function loadSettings() {
    const result = await chrome.storage.local.get([
        'outputSubfolder',
        'sourceSubfolder',
        'settings_generationTimeout',
        'settings_downloadTimeout',
        'settings_pageLoadTimeout',
        'settings_stepDelay',
        'settings_taskInterval',
        'settings_maxRetries',
        'settings_retryDelay',
        'settings_continueOnError'
    ]);

    // Set Timing Inputs (or defaults)
    generationTimeoutInput.value = result.settings_generationTimeout || DEFAULTS.settings_generationTimeout;
    downloadTimeoutInput.value = result.settings_downloadTimeout || DEFAULTS.settings_downloadTimeout;
    pageLoadTimeoutInput.value = result.settings_pageLoadTimeout || DEFAULTS.settings_pageLoadTimeout;
    stepDelayInput.value = result.settings_stepDelay || DEFAULTS.settings_stepDelay;
    taskIntervalInput.value = result.settings_taskInterval || DEFAULTS.settings_taskInterval;

    // Set Retry Inputs (or defaults)
    maxRetriesInput.value = result.settings_maxRetries !== undefined ? result.settings_maxRetries : DEFAULTS.settings_maxRetries;
    retryDelayInput.value = result.settings_retryDelay || DEFAULTS.settings_retryDelay;
    continueOnErrorInput.checked = result.settings_continueOnError !== undefined ? result.settings_continueOnError : DEFAULTS.settings_continueOnError;

    // Check Source Handle
    const sourceHandle = await getHandle('sourceHandle');
    if (sourceHandle) {
        sourceStatus.textContent = `✅ Selected: ${sourceHandle.name}`;
        sourceStatus.className = 'status success';
    } else if (result.sourceSubfolder) {
        sourceStatus.textContent = `⚠️ Saved: ${result.sourceSubfolder} (Re-select needed)`;
    }

    // Check Output Handle
    const outputHandle = await getHandle('outputHandle');
    if (outputHandle) {
        outputStatus.textContent = `✅ Selected: ${outputHandle.name}`;
        outputStatus.className = 'status success';
    } else if (result.outputSubfolder) {
        outputStatus.textContent = `⚠️ Saved: ${result.outputSubfolder} (Re-select needed)`;
    }
}

// Save Timing Settings
saveSettingsBtn.addEventListener('click', async () => {
    try {
        const settings = {
            settings_generationTimeout: parseInt(generationTimeoutInput.value, 10),
            settings_downloadTimeout: parseInt(downloadTimeoutInput.value, 10),
            settings_pageLoadTimeout: parseInt(pageLoadTimeoutInput.value, 10),
            settings_stepDelay: parseInt(stepDelayInput.value, 10),
            settings_taskInterval: parseInt(taskIntervalInput.value, 10)
        };

        await chrome.storage.local.set(settings);
        
        saveStatus.textContent = '✅ Settings Saved!';
        saveStatus.className = 'status success';
        setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    } catch (err) {
        console.error(err);
        saveStatus.textContent = '❌ Error Saving';
        saveStatus.className = 'status error';
    }
});

loadSettings();

// Select Source Folder
selectSourceBtn.addEventListener('click', async () => {
    try {
        const handle = await window.showDirectoryPicker({
            id: 'gemini-autogen-source',
            mode: 'readwrite'
        });

        await setHandle('sourceHandle', handle);
        await chrome.storage.local.set({ sourceSubfolder: handle.name });

        sourceStatus.textContent = `✅ Selected: ${handle.name}`;
        sourceStatus.className = 'status success';
    } catch (err) {
        console.error(err);
    }
});

// Select Output Folder
selectOutputBtn.addEventListener('click', async () => {
    try {
        const handle = await window.showDirectoryPicker({
            id: 'gemini-autogen-output',
            mode: 'readwrite'
        });

        await setHandle('outputHandle', handle);
        await chrome.storage.local.set({ outputSubfolder: handle.name });

        outputStatus.textContent = `✅ Selected: ${handle.name}`;
        outputStatus.className = 'status success';
    } catch (err) {
        console.error(err);
    }
});

// Save Retry Settings
saveRetryBtn.addEventListener('click', async () => {
    try {
        const retrySettings = {
            settings_maxRetries: parseInt(maxRetriesInput.value, 10),
            settings_retryDelay: parseInt(retryDelayInput.value, 10),
            settings_continueOnError: continueOnErrorInput.checked
        };

        await chrome.storage.local.set(retrySettings);

        retrySaveStatus.textContent = '✅ Retry Settings Saved!';
        retrySaveStatus.className = 'status success';
        setTimeout(() => { retrySaveStatus.textContent = ''; }, 3000);
    } catch (err) {
        console.error(err);
        retrySaveStatus.textContent = '❌ Error Saving';
        retrySaveStatus.className = 'status error';
    }
});

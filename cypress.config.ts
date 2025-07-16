import { defineConfig } from 'cypress'

export default defineConfig({
  retries: 3,
  video: false,
  screenshotOnRunFailure: true,
  reporter: 'junit',
  defaultCommandTimeout: 10000,
  reporterOptions: {
    mochaFile: 'reports/report-[hash].xml',
    toConsole: false,
  },
  env: {
    username: 'admin',
    password: 'password',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'firefox') {
          launchOptions.preferences['browser.download.manager.alertOnEXEOpen'] = false;
          launchOptions.preferences['browser.helperApps.neverAsk.saveToDisk'] = 'application/csv, text/csv, text/plain,application/octet-stream doc xls pdf txt xml json';
          launchOptions.preferences['browser.download.manager.focusWhenStarting'] = false;
          launchOptions.preferences['browser.download.useDownloadDir'] = true;
          launchOptions.preferences['browser.helperApps.alwaysAsk.force'] = false;
          launchOptions.preferences['browser.download.manager.closeWhenDone'] = true;
          launchOptions.preferences['browser.download.manager.showAlertOnComplete'] = false;
          launchOptions.preferences['browser.download.manager.useWindow'] = false;
          launchOptions.preferences['services.sync.prefs.sync.browser.download.manager.showWhenStarting'] = false;
          launchOptions.preferences['pdfjs.disabled'] = true;

          return launchOptions;
        }
      });
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:11222/console/'
  },
})

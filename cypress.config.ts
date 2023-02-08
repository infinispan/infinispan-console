import { defineConfig } from 'cypress'

export default defineConfig({
  retries: 3,
  video: true,
  screenshotOnRunFailure: true,
  reporter: 'junit',
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
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/cache-create-wizard-template.cy.js',
    baseUrl: 'http://localhost:11222/console/',
  },
})

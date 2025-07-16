// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const COMMAND_DELAY = 0;

for (const command of ['click', 'trigger', 'type', 'clear', 'reload']) {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
        const origVal = originalFn(...args);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(origVal);
            }, COMMAND_DELAY);
        });
    });
}

Cypress.Commands.add('login', (username, password, url = '/') => {
  cy.visit(url, {
    headers: {
      'Accept-Encoding': 'gzip, deflate, br'
    },
    auth: {
      username: username,
      password: password
    }
  });
  cy.get('[data-cy=sideBarToggle]').click();
});

Cypress.Commands.add('cleanupTest',(username, password, endpoint = '/', method = 'DELETE', body = '', ignoreError = false) => {
  cy.request({
    method: method,
    url: endpoint.includes('http') ? endpoint : 'http://localhost:11222/rest/v2' + endpoint,
    auth: {
      username: username,
      password: password
    },
    body: body,
    headers: {
      'Content-Type': 'application/json',
    },
    // Ignore if 404 on delete
    failOnStatusCode: !(method == 'DELETE' || ignoreError)
  });
});

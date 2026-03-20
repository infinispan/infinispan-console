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

Cypress.Commands.add('typeInMonacoEditor', (containerSelector, text) => {
  cy.get(containerSelector + ' textarea.inputarea').click({force: true}).focused().type(text, {force: true});
});

Cypress.Commands.add('clearAndTypeInMonacoEditor', (containerSelector, text) => {
  cy.get(containerSelector + ' textarea.inputarea').click({force: true}).focused()
    .type('{selectall}', {force: true})
    .type(text, {force: true, parseSpecialCharSequences: false});
});

Cypress.Commands.add('dismissAlerts', () => {
  cy.get('body').then(($body) => {
    const closeButtons = $body.find('button[name="close-alert-button"]');
    if (closeButtons.length) {
      cy.wrap(closeButtons).each(($btn) => {
        cy.wrap($btn).click({ force: true });
      });
    }
  });
});

Cypress.Commands.add('cleanupTest',(username, password, endpoint = '/', method = 'DELETE', body = '', ignoreError = false, port = '11222') => {
  cy.request({
    method: method,
    url: endpoint.includes('http') ? endpoint : `http://localhost:${port}/rest/v2` + endpoint,
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

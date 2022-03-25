
describe('Cache Templates Overview', () => {

  beforeEach(() => {
    cy.login(Cypress.env("username"), Cypress.env("password"));
  })

 it('successfully loads templates', () => {
   cy.get('button[aria-label="view-cache-configurations-button"]').click();
   cy.get('h1').should('contain', 'Cache templates');
   cy.contains('e2e-test-template');
 })
});


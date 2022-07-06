
describe('Cache Detail Overview', () => {
  beforeEach(() => {
    cy.login(Cypress.env("username"), Cypress.env("password"), '/cache/people');
  })

 it('successfully loads cache detail', () => {
   cy.contains('people');
   cy.contains('Transactional');
   cy.contains('Distributed');
   cy.contains('Rebalancing is on');
 })

});


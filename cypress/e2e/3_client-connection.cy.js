describe('Client connection page', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/connected-clients');
  });

  it('successfully loads Client connections', () => {
    cy.get('h1').should('contain', 'Connected clients');
    cy.contains('List and filter connected clients to this cluster').should('exist');;
    cy.contains('Server node').should('exist');
    cy.contains('Principal').should('exist');
    cy.contains('Client library').should('exist');
    cy.contains('Client address').should('exist');
    cy.contains('Client version').should('exist');
    cy.contains('infinispan-4-e2e').should('exist');
  });
});

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
    cy.contains('Protocol').should('exist');
    cy.contains('infinispan-4-e2e').should('exist');
  });

  it('successfully filters and refreshes the page', () => {
    cy.get('[aria-label="Search input"]').type('test');
    cy.contains('infinispan-4-e2e').should('not.exist');
    cy.contains('No filtered connected clients').should('exist');
    //Refreshing the page
    cy.get('[data-cy=aclActions]').click();
    cy.get('[data-cy=refreshAction]').click();
    //Check that page is refreshed properly
    cy.contains('infinispan-4-e2e').should('exist');
    cy.contains('No filtered connected clients').should('not.exist');
  });
});

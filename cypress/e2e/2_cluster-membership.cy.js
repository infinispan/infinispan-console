describe('Cluster Membership', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cluster-membership');
  });

  it('successfully loads Cluster Membership', () => {
    cy.get('h1').should('contain', 'Cluster membership');
  });
});

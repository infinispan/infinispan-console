describe('Global stats', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/access-management');
  });

  it('successfully loads Access Management page', () => {
    cy.get('h1').should('contain', 'Access management');
    cy.contains('admin');
    cy.contains('Superuser');
  });
});

describe('Cluster Membership', () => {
  it('successfully loads Cluster Membership', () => {
    cy.visit('http://localhost:11222/console/welcome');
    cy.get('h2').should('contain', 'Welcome to Infinispan Server');
  });
});

describe('Global stats', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/global-stats');
  });

  it('successfully loads Global stats', () => {
    cy.get('h1').should('contain', 'Global statistics');
    cy.contains('Cluster-wide statistics');
    cy.contains('Cluster distribution');
  });

  it('successfully links to caches link', () => {
    //click View all caches should navigate to console page
    cy.get('[data-cy="viewCachesLink"]').click();
    //Verify that page is properly loaded after click;
    cy.contains('Data container');
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.contains('default'); // cache default
    cy.contains('java-serialized-cache');
  });
});

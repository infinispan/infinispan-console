describe('Global stats', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/global-stats');
  });

  it('successfully loads Global stats', () => {
    cy.get('h1').should('contain', 'Global statistics');
    cy.contains('Cluster-wide statistics');
    cy.contains('Data access statistics');
    cy.contains('Cache Manager lifecycle values');
    cy.contains('Operation performance values');
    cy.contains('Cluster distribution');
  });

  //View all caches href
  it('successfully loads Global stats', () => {
    //click View all caches should navigate to console page
    cy.get('[data-cy="viewCachesLink"]').click();
    //Verify that page is properly loaded after click;
    cy.contains('Default'); // cluster name
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.contains('default'); // cache default
    cy.contains('java-serialized-cache');
  });

  //View Cluster Status href
  it('successfully loads Global stats', () => {
    //click View Cluster Status should navigate to cluster-membership page
    cy.get('[data-cy="viewClustersLink"]').click();

    //Verify that page is properly loaded after click;
    cy.get('h1').should('contain', 'Cluster membership');
    cy.contains('Healthy');
  });
});

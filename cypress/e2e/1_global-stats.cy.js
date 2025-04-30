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

  it('successfully links to cluster status', () => {
    //click View Cluster Status should navigate to cluster-membership page
    cy.get('[data-cy="viewClustersLink"]').click();

    //Verify that page is properly loaded after click;
    cy.get('h1').should('contain', 'Cluster membership');
    cy.contains('Running');
  });

  it('successfully resets and refresh global metrics', () => {
    cy.get('[data-cy="globalStatsActions"]').click();
    cy.get('[data-cy="clearAccessMetricsButton"]').click();
    cy.contains('Permanently clear global metrics?');
    cy.get('[data-cy="confirmButton"]').click();
    cy.contains('Global metrics cleared');
    cy.get('[data-cy="globalStatsActions"]').click();

    //Comparing the value of the start time before and after refresh to make sure that refresh takes place
    cy.get('[data-cy=cacheManagerStartTime]').then(($field) => {
      const timeTextBefore = $field.text();
      //Wait for a few seconds before refresh
      cy.wait(2000);

      //Refreshing the stat page
      cy.get('[data-cy="refreshAction"]').click();

      cy.get('[data-cy=cacheManagerStartTime]').then(($field) => {
        const timeTextAfter = $field.text();
        if (timeTextBefore === timeTextAfter) {
          throw new Error("The page was not refreshed properly.")
        }
      });
    });
  });

});

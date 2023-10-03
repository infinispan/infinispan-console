describe('Cache Metrics Overview', () => {
  it('successfully checks cache metrics', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/people');
    //Check for Labels
    cy.contains('Metrics (Enabled)').click();
    cy.contains('Approx. number of entries');
    cy.contains('Minimum number of nodes');

    // Check for data greater than -1
    cy.get('dt[aria-label="view-cache-approximate-unique-entries"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', -1);
    cy.get('dt[aria-label="view-cache-metrics-nodes"]').invoke('text').then(parseFloat).should('be.gt', -1);

    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Entries');
    cy.contains('Memory');
    cy.contains('Performance');
    cy.contains('Data access');
    cy.contains('Data for nodes');


    cy.contains('Hits: ');
    cy.contains('Misses: ');
    cy.contains('Stores: ');
    cy.contains('Retrievals: ');
    cy.contains('Remove hits: ');
    cy.contains('Remove misses: ');
    cy.contains('Evictions: ');

    cy.get('[data-cy=data-access-chart]').should('exist');
    cy.get('[data-cy=data-distribution-chart]').should('exist');
  });

  it('successfully checks cache metrics for heap memory', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/heap-test');
    cy.contains('Metrics (Enabled)').click();
    cy.contains('Size in heap memory');
    cy.get('dt[aria-label="view-cache-metrics-heap"]').invoke('text').then(parseFloat).should('be.gt', -1);
  });

  it('successfully checks cache metrics for off-heap memory', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/off-heap-test');
    cy.contains('Metrics (Enabled)').click();
    cy.contains('Size in off-heap memory');
    cy.get('dt[aria-label="view-cache-metrics-off-heap"]').invoke('text').then(parseFloat).should('be.gt', -1);
  });
});

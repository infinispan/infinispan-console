describe('Data Container Caches', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  //Hide created cache and check the hidden filter
  it('successfully ignore / undo ignore a cache', () => {
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=ignoreCacheAction]').click();
    cy.get('[data-cy=ignoreCacheModal]').should('exist');
    cy.get('#hideShowModal [aria-label=Close]').click(); //Closing modal with close button
    cy.get('[data-cy=ignoreCacheModal]').should('not.exist');

    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=ignoreCacheAction]').click();
    cy.get('[data-cy=ignoreCacheModal]').should('exist');
    cy.get('[data-cy=cancelAction]').click(); //Closing modal with Cancel button
    cy.get('[data-cy=ignoreCacheModal]').should('not.exist');
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=ignoreCacheAction]').click();
    cy.get('[data-cy=hideCacheButton]').click(); //Hiding cache

    cy.contains('Cache default hidden.').should('exist');
    cy.get('[data-cy=ignoreBadge-default]').should('exist');

    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded] div > button').click();
    cy.get('[data-cy="hiddenStatus"]').find('input:checkbox').click(); //Filtering hidden caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.get('[data-cy=ignoreBadge-default]').should('exist');
    cy.contains('default');

    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=showCacheAction]').click();
    cy.get('[data-cy=undoCacheModal]').should('exist');
    cy.get('#hideShowModal [aria-label=Close]').click(); //Closing modal with close button
    cy.get('[data-cy=undoCacheModal]').should('not.exist');

    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=showCacheAction]').click();
    cy.get('[data-cy=undoCacheModal]').should('exist');
    cy.get('[data-cy=cancelAction]').click(); //Closing modal with Cancel button
    cy.get('[data-cy=undoCacheModal]').should('not.exist');
    cy.get('[data-cy=actions-default]').click();
    cy.get('[aria-label=showCacheAction]').click();
    cy.get('[data-cy=showCacheButton]').click(); //Hiding cache

    cy.contains('Cache default is now visible.').should('exist');
    cy.get('[data-cy=ignoreBadge-default]').should('not.exist');
  });
});

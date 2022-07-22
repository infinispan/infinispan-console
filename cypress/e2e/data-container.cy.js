describe('Data Container Overview', () => {
  const numberOfCaches = 19;

  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  //Data Container Overview
  it('successfully loads Data Container Overview', () => {
    cy.contains('Default'); // cluster name
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.get('[data-cy=navigationTabs]').should('exist');
    cy.get('#cache-table-toolbar').should('exist');
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    cy.get('[data-cy=createCacheButton]').should('exist');
    cy.get('[data-cy=showTemplatesButton]').should('exist');
    cy.get('[data-cy=cachesTable]').should('exist');
    cy.contains('default'); // cache default
    cy.contains('octet-stream-cache').should('not.exist'); // cache octet-stream-cache is already on the next page
    //make sure there are total 4 tabs (0,1,2,3)
    cy.get('a[aria-label="nav-item-Caches"]').click();
    cy.get('a[aria-label="nav-item-Tasks"]').click();
    cy.get('a[aria-label="nav-item-Counters"]').click();
    cy.get('a[aria-label="nav-item-Schemas"]').click();
  });

  //Testing pagination and navigation
  it('successfully navigates through the caches as well as changes number of viewed caches on the page', () => {
    cy.contains(numberOfCaches + ' Caches');
    cy.contains('10 Counters');
    cy.contains('1 Tasks');
    cy.contains('11 Schemas');

    cy.contains('1 - 10 of ' + numberOfCaches);
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('invalidationCache');
    cy.get('[data-action=previous]').should('be.disabled');
    cy.get('[data-action=next]').click();

    //Verify that the other caches are visible
    var numOfCachesOnNextPage = numberOfCaches - 10;
    cy.get('[data-cy=cachesTable] tr').should('have.length', numOfCachesOnNextPage + 1); //including header row
    cy.contains('people');
    cy.contains('xml-cache');

    cy.get('[data-action=next]').should('be.disabled');

    //Going back to the first page
    cy.get('[data-action=previous]').click();
    cy.get('[data-action=previous]').should('be.disabled');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('invalidationCache');
    cy.contains('people').should('not.exist');
    cy.contains('xml-cache').should('not.exist');

    //Changing the number of items on the page
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-10] > div').should('exist'); //Verifying the selected option
    cy.get('[data-action=per-page-20] > div').should('not.exist');
    cy.get('[data-action=per-page-50] > div').should('not.exist');
    cy.get('[data-action=per-page-100] > div').should('not.exist');
    cy.get('[data-action=per-page-20]').click();

    //Verifying that all caches are shown and navigation buttons are disabled
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-10] > div').should('not.exist'); //Verifying the selected option
    cy.get('[data-action=per-page-20] > div').should('exist');
    cy.get('[data-action=per-page-50] > div').should('not.exist');
    cy.get('[data-action=per-page-100] > div').should('not.exist');
    cy.get('[data-cy=cachesTable] tr').should('have.length', numberOfCaches + 1); // including header row
    cy.get('[data-action=next]').should('be.disabled');
    cy.get('[data-action=previous]').should('be.disabled');
    cy.contains('java-serialized-cache');
    cy.contains('people');
    cy.contains('xml-cache');

    //Changing the number of items on the page to 3rd option
    cy.get('[data-action=per-page-50]').click();
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-10] > div').should('not.exist'); //Verifying the selected option
    cy.get('[data-action=per-page-20] > div').should('not.exist');
    cy.get('[data-action=per-page-50] > div').should('exist');
    cy.get('[data-action=per-page-100] > div').should('not.exist');
    cy.get('[data-cy=cachesTable] tr').should('have.length', numberOfCaches + 1); //including header row
    cy.get('[data-action=next]').should('be.disabled');
    cy.get('[data-action=previous]').should('be.disabled');
    cy.contains('java-serialized-cache');
    cy.contains('people');
    cy.contains('xml-cache');

    //Changing the number of items on the page to 4th option
    cy.get('[data-action=per-page-100]').click();
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-10] > div').should('not.exist'); //Verifying the selected option
    cy.get('[data-action=per-page-20] > div').should('not.exist');
    cy.get('[data-action=per-page-50] > div').should('not.exist');
    cy.get('[data-action=per-page-100] > div').should('exist');
    cy.get('[data-cy=cachesTable] tr').should('have.length', numberOfCaches + 1); //including header row
    cy.get('[data-action=next]').should('be.disabled');
    cy.get('[data-action=previous]').should('be.disabled');
    cy.contains('java-serialized-cache');
    cy.contains('people');
    cy.contains('xml-cache');
  });

  //Testing the filters
  it('sucessfully filters caches by type and features', () => {
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('not.exist');

    //Filtering by Local caches
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Local"]').click(); //Filtering local caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox

    //Verifying that only local caches are shown
    cy.contains('default');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 3); //3 including header row
    //Verifying that all entries are local caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Local');
    });

    //Clears all filters
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('default');
    cy.contains('invalidationCache');
    cy.contains('people').should('not.exist');

    //Filtering by Replicated caches
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Replicated"]').click(); //Filtering replicated caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox

    //Verifying that only replicated caches are shown
    cy.contains('jboss-cache');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row
    //Verifying that all entries are replicated caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Replicated');
    });

    //Adding filter by Invalidation and Scattered caches
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Invalidated"]').click(); //Filtering invalidated caches
    cy.get('[id$="Scattered"]').click(); //Filtering scattered caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox

    //Verifying that only replicated,invalidated and scattered caches are shown
    cy.contains('jboss-cache');
    cy.contains('invalidationCache');
    cy.contains('scattered-cache');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 4); //4 including header row

    //Clears all filters
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    cy.contains('default');
    cy.contains('invalidationCache');
    cy.contains('octet-stream-cache').should('not.exist');

    //Filtering by Distributed caches
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Distributed"]').click(); //Filtering distributed caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox

    //Verifying that only distributed caches are shown
    cy.contains('1 - 10 of 14');
    cy.contains('java-serialized-cache');
    cy.contains('text-cache').should('not.exist');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 11); //11 including header row
    //Navigating to the next page to see the rest of the caches
    cy.get('[data-action=next]').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', 5); //5 including header row
    cy.contains('xml-cache');
    cy.contains('text-cache');
    cy.contains('java-serialized-cache').should('not.exist');

    //Changing the number of caches on the page to view them all
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-20]').click();
    cy.contains('not-encoded');
    cy.contains('xml-cache');
    cy.contains('text-cache');
    cy.contains('1 - 14 of 14');
    cy.get('[data-cy=cachesTable] tr').should('have.length', 15); //15 including header row

    //Verifying that all entries are distributed caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Distributed');
    });

    //Adding Transactional feature to filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Transactions"]').click(); //Filtering transactional caches (already on filtered distributed caches)
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 5); //5 including header row
    // //Verifying that all entries are distributed and transactional caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Distributed');
    });
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains('Transactional');
    });
    cy.contains('heap-test');
    cy.contains('off-heap-test');
    cy.contains('people');
    cy.contains('super-cache');

    // //Adding Replicated type filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Replicated"]').click(); //Filtering transactional caches (already on filtered distributed caches)+replicated
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 5); //5 including header row - nothing is changed
    //Verifying that all entries are distributed and transactional caches
    cy.get('[data-cy^=type-]').each((badge) => {
      cy.wrap(badge).contains('Distributed');
    });
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains('Transactional');
    });
    cy.contains('heap-test');
    cy.contains('off-heap-test');
    cy.contains('people');
    cy.contains('super-cache');

    // //Removing Distributed filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Distributed"]').click(); //Filtering transactional caches & replicated ones
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.contains('No caches yet');

    //Removing Replicated filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Replicated"]').click(); //Filtering transactional caches & replicated ones
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 5); //5 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains('Transactional');
    });

    //Adding Indexed filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Indexed"]').click(); //Filtering transactional caches & replicated ones
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 6); //6 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Transactional|Indexed/);
    });

    //Clearing all filters
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=cachesTable] tr').should('have.length', numberOfCaches + 1); //18 including header row because upper the items per page is changed
    cy.contains('default');
    cy.contains('java-serialized-cache');
    cy.contains('people');

    //Adding Secured filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Authorization"]').click(); //Filtering secured caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 3); //3 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Secured/);
    });
    cy.contains('indexed-cache');
    cy.contains('super-cache');

    //Clearing all filters and setting Persistence
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Persistence"]').click(); //Filtering secured caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Persistent/);
    });
    cy.contains('super-cache');

    //Adding Bounded filter
    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Bounded"]').click(); //Filtering secured caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 4); //4 including header row - nothing is changed
    cy.get('[data-cy^=feature-]').each((badge) => {
      cy.wrap(badge).contains(/Bounded/);
    });
    cy.contains('super-cache');
    cy.contains('heap-test');
    cy.contains('aSimpleXmlCache');
  });

  //Hide created cache and check the hidden filter
  it('successfully ignores the cache', () => {
    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=ignoreCacheAction]').click();
    cy.get('[data-cy=ignoreCacheModal]').should('exist');
    cy.get('#hideShowModal > .pf-m-plain').click(); //Closing modal with close button
    cy.get('[data-cy=ignoreCacheModal]').should('not.exist');

    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=ignoreCacheAction]').click();
    cy.get('[data-cy=ignoreCacheModal]').should('exist');
    cy.get('[data-cy=cancelAction]').click(); //Closing modal with Cancel button
    cy.get('[data-cy=ignoreCacheModal]').should('not.exist');
    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=ignoreCacheAction]').click();
    cy.get('[data-cy=hideCacheButton]').click(); //Hiding cache

    cy.contains('Cache aCache hidden.').should('exist');
    cy.get('[data-cy=ignoreBadge-aCache]').should('exist');

    cy.get('[data-cy=cacheFilterSelect]').click();
    cy.get('[data-cy=cacheFilterSelectExpanded]').should('exist');
    cy.get('[id$="Hidden"]').click(); //Filtering hidden caches
    cy.get('[data-cy=cacheFilterSelect]').click(); //Closing filter selectbox
    cy.get('[data-cy=cachesTable] tr').should('have.length', 2); //2 including header row - nothing is changed
    cy.get('[data-cy=ignoreBadge-aCache]').should('exist');
    cy.contains('aCache');
  });

  //Show (undo ignored cache) created cache
  it('successfully undos the ignore the cache action', () => {
    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=showCacheAction]').click();
    cy.get('[data-cy=undoCacheModal]').should('exist');
    cy.get('#hideShowModal > .pf-m-plain').click(); //Closing modal with close button
    cy.get('[data-cy=undoCacheModal]').should('not.exist');

    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=showCacheAction]').click();
    cy.get('[data-cy=undoCacheModal]').should('exist');
    cy.get('[data-cy=cancelAction]').click(); //Closing modal with Cancel button
    cy.get('[data-cy=undoCacheModal]').should('not.exist');
    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=showCacheAction]').click();
    cy.get('[data-cy=showCacheButton]').click(); //Hiding cache

    cy.contains('Cache aCache is now visible.').should('exist');
    cy.get('[data-cy=ignoreBadge-aCache]').should('not.exist');
  });

  //Delete created cache
  it('successfully deletes a cache', () => {
    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=deleteCacheAction]').click();
    cy.get('#deleteCacheModal').should('exist');
    cy.contains('Permanently delete cache?');
    cy.get('#deleteCacheModal > .pf-m-plain').click(); //Closing modal with close button
    cy.contains('Permanently delete cache?').should('not.exist');

    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=deleteCacheAction]').click();
    cy.contains('Permanently delete cache?');
    cy.get('[data-cy=cancelCacheDeleteButton]').click(); //Closing modal with Cancel button
    cy.contains('Permanently delete cache?').should('not.exist');

    cy.get('[data-cy=actions-aCache]').click();
    cy.get('[data-cy=deleteCacheAction]').click();
    cy.get('#cache-to-delete').click();
    cy.get('#cache-to-delete').type('aCache');
    cy.get('[data-cy=deleteCacheButton]').click(); //Deleting cache aCache

    cy.contains('Cache aCache deleted.');
    cy.get('.pf-c-alert__action > .pf-c-button').click(); //Closing alert popup.
    cy.get('aCache').should('not.exist'); //Checking that deleted cache is not visible
  });

  // Displays templates page
  it('Displays cache configuration templates page', () => {
    cy.get('[data-cy=showTemplatesButton]').click();
    cy.contains('Cache templates');

    //Going back with breadcrumb link;
    cy.get('[data-cy=dataContainerLink]').click(); //Clicking on breadcrumb link.

    //Is redirected to Data Container page
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');

    //Go to Config page again
    cy.get('[data-cy=showTemplatesButton]').click();
    cy.get('[data-cy=e2e-test-templateConfig]').should('be.visible');
    cy.get('#e2e-test-templateConfigExpanded').should('not.be.visible');
    //Clicking on the config name - config should appear
    cy.get('[data-cy=e2e-test-templateConfig] > button').click();
    cy.get('#e2e-test-templateConfigExpanded').should('be.visible');
    cy.contains('distributed-cache-configuration');
    //Clicking on the config name - config should disappear
    cy.get('[data-cy=e2e-test-templateConfig] > button').click();
    cy.get('#e2e-test-templateConfigExpanded').should('not.be.visible');
    cy.contains('distributed-cache-configuration').should('not.be.visible');
  });
});

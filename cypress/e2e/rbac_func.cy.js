describe('RBAC Functionlity Tests', () => {
  const monitorUserName = 'monitor';
  const observerUserName = 'observer';
  const applicationUserName = 'application';
  const deployerUserName = 'deployer';

  it('successfully logins and performs actions with monitor user', () => {
    cy.login(monitorUserName, Cypress.env('password'));
    checkDataContainerView(true, false, false, false);
    checkSecuredCacheDetailsView(true, false, false, 'monitor', 'indexed-cache');
    checkNotOwnSecuredCache('super-cache');
    checkNonSecuredCacheDetailView(true, false);
  });

  it('successfully logins and performs actions with observer user', () => {
    cy.login(observerUserName, Cypress.env('password'));

    checkDataContainerView(false, false, false, false);
    checkSecuredCacheDetailsView(false, false, false, 'observer', 'indexed-cache');
    cy.contains('Elaia');
    cy.get('[data-cy=actions-elaia]').should('exist');
    //Running query on secured page
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Person where age>2');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Elaia');

    checkNotOwnSecuredCache('super-cache');
    checkNonSecuredCacheDetailView(false, false);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(false);
    checkCountersPageView();
  });

  it('successfully logins and performs actions with application user', () => {
    cy.login(applicationUserName, Cypress.env('password'));

    checkDataContainerView(false, false, false, false);
    checkSecuredCacheDetailsView(false, true, false, 'application', 'super-cache');
    checkActionsOnSuperCache();

    checkNotOwnSecuredCache('indexed-cache');
    checkNonSecuredCacheDetailView(false, false);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(false);
    checkCountersPageView();
  });

  it('successfully logins and performs actions with deployer user', () => {
    cy.login(deployerUserName, Cypress.env('password'));

    checkDataContainerView(false, true, true, false);
    checkSecuredCacheDetailsView(false, true, false, 'deployer', 'super-cache');
    checkActionsOnSuperCache();

    checkNotOwnSecuredCache('indexed-cache');
    checkNonSecuredCacheDetailView(false, false);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(true);
    checkCountersPageView();
  });

  it('successfully logins and performs actions with admin user', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));

    checkDataContainerView(false, true, true, true);
    checkSecuredCacheDetailsView(false, true, true, 'admin', 'super-cache');
    checkActionsOnSuperCache();

    checkNotOwnSecuredCache('text-cache');
    checkNonSecuredCacheDetailView(false, true);
    //Go to tasks (@TODO at the moment for observer no tasks are shown, add after fix)
    checkSchemasPageView(true);
    checkCountersPageView();
    checkTasksPage();
  });

  function checkDataContainerView(isMonitor, isDeployer, isAdmin, isSuperAdmin) {
    //Checking Data Container view
    cy.contains('Default'); // cluster name
    cy.contains('Running'); // cluster status
    if (isSuperAdmin) {
      cy.get('[data-cy=rebalancingSwitch]').should('exist'); // rebalancing status
    } else {
      cy.get('[data-cy=rebalancingSwitch]').should('not.exist'); // rebalancing status
    }

    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=navigationTabs]').should('exist');
    cy.contains('18 Caches');
    cy.contains('12 Counters');
    if (isMonitor) {
      cy.contains('1 Tasks').should('not.exist');
      cy.contains('13 Schemas').should('not.exist');
    } else {
      //cy.contains('1 Tasks'); //Should be uncommented after feature is implemented
      cy.contains('13 Schemas');
    }
    cy.get('#cache-table-toolbar').should('exist');
    cy.get('[data-cy=paginationArea]').should('exist');
    cy.get('[data-cy=cacheFilterSelect]').should('exist');
    if (isDeployer || isAdmin) {
      cy.get('[data-cy=createCacheButton]').should('exist');
    } else {
      cy.get('[data-cy=createCacheButton]').should('not.exist');
    }
    cy.get('[data-cy=showTemplatesButton]').should('exist');
    cy.get('[data-cy=cachesTable]').should('exist');
    cy.contains('default'); // cache default
    if (isAdmin) {
      cy.get('[data-cy=actions-default]').should('exist');
      cy.get('[data-cy=actions-default]').click();
      if (isSuperAdmin) {
        cy.get('[data-cy=ignoreCacheAction]').should('exist');
      } else {
        cy.get('[data-cy=ignoreCacheAction]').should('not.exist');
      }
      cy.get('[data-cy=deleteCacheAction]').should('exist');

    } else {
      cy.get('[data-cy=actions-default]').should('not.exist');
    }

  }

  function checkSecuredCacheDetailsView(isMonitor, isAdmin, isSuperAdmin, roleName, cacheName) {
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-100]').click();
    //Going to secured cache details page
    cy.get('[data-cy=detailButton-' + cacheName + ']').click();
    if (isAdmin) {
      cy.get('[data-cy=addEntryButton]').should('exist');
      cy.get('[data-cy=clearAllButton]').should('exist');
    } else {
      cy.get('[data-cy=addEntryButton]').should('not.exist');
      cy.get('[data-cy=clearAllButton]').should('not.exist');
    }

    if (isSuperAdmin) {
      cy.get('#rebalancing-switch').should('exist');
    } else {
      cy.get('#rebalancing-switch').should('not.exist');
    }

    if (isMonitor) {
      cy.get('[data-cy=cacheEntriesTab]').should('not.exist');
      cy.get('[data-cy=queriesTab]').should('not.exist');
    } else {
      cy.get('[data-cy=cacheEntriesTab]').should('exist');
      cy.get('[data-cy=queriesTab]').should('exist');
    }

    //Checking cache configuration page
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains('authorization');
    cy.contains(roleName);
    cy.get('[data-cy=manageIndexesLink]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=clearIndexButton]').should('exist');
    } else {
      cy.get('[data-cy=clearIndexButton]').should('not.exist');
    }

    cy.get('[data-cy=backButton]').click();
    //Going to metrics page
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Retrievals: ');
    if (isSuperAdmin) {
      cy.get('[data-cy=clearQueryMetricsButton]').should('exist');
    } else {
      cy.get('[data-cy=clearQueryMetricsButton]').should('not.exist');
    }

    if (!isMonitor)
      //Going back to cache entries tab
      cy.get('[data-cy=cacheEntriesTab]').click();
  }

  function checkNotOwnSecuredCache(cacheName) {
    //Checking super cache to be disabled for observer/monitor
    cy.contains('Data container').click();
    cy.get('[id^="pagination-caches-top-pagination"]').click();
    cy.get('[data-action=per-page-100]').click();
    cy.get('[data-cy=detailButton-' + cacheName + ']').should('be.disabled');
  }

  function checkNonSecuredCacheDetailView(isMonitor, isSuperAdmin) {
    //Checking actions on non-secured cache
    cy.get('[data-cy=detailButton-indexed-cache-no-auth]').click();
    if (isSuperAdmin) {
      cy.get('#rebalancing-switch').should('exist');
    } else {
      cy.get('#rebalancing-switch').should('not.exist');
    }

    cy.get('[data-cy=addEntryButton]').click();
    //Waiting till at least one popup dissappears so that it is possible to type
    cy.wait(1500);
    cy.get('#key-entry').click().type('stringKey');
    cy.get('#valueContentType').click();
    cy.get('[id="Custom Type"]').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Child","name": "Baby","age": 1,"city": "Miami"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache indexed-cache-no-auth.');
    cy.contains('stringKey');
    cy.contains('Baby');
    //Adding more entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#cacheName').should('be.disabled');
    cy.get('#key-entry').click().type('stringKey1');
    cy.get('#value-entry').click().type('stringValue1');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache indexed-cache-no-auth.');
    cy.contains('stringKey1');
    cy.contains('stringValue1');
    //Editing entry
    cy.get('[data-cy=actions-stringKey1]').click();
    cy.get('[data-cy=editEntryAction]').click();
    cy.get('#value-entry').click().type('changedValue');
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache indexed-cache-no-auth.');
    cy.contains('changedValue');
    //Deleting entry
    cy.get('[data-cy=actions-stringKey1]').click();
    cy.get('[data-cy=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry stringKey1 deleted.');
    cy.contains('stringValue1').should('not.exist');
    //Running query
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Child where age<2');
    cy.get('[data-cy=searchButton]').click();
    if (!isMonitor) {
      //@TODO remove when the bug is fixed
      cy.contains('1 - 1 of 1');
      cy.contains('Baby');
    }
    //Deleting all entries
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
    cy.wait(1500); //Waiting till the whole page is loaded
    //Checking cache configuration page
    cy.get('[data-cy=cacheConfigurationTab]').click();
    cy.contains('authorization').should('not.exist');
    cy.get('[data-cy=manageIndexesLink]').click();
    if (isSuperAdmin) {
      cy.get('[data-cy=clearIndexButton]').should('exist');
    } else {
      cy.get('[data-cy=clearIndexButton]').should('not.exist');
    }

    cy.get('[data-cy=backButton]').click();
    //Going to metrics page
    cy.get('[data-cy=cacheMetricsTab]').click();
    cy.contains('Retrievals: ');
    if (isSuperAdmin) {
      cy.get('[data-cy=clearQueryMetricsButton]').should('exist');
    } else {
      cy.get('[data-cy=clearQueryMetricsButton]').should('not.exist');
    }

  }

  function checkSchemasPageView(isAdmin) {
    //Go to schemas and check that no create/edit/delete buttons available
    cy.contains('Data container').click();
    cy.get('a[aria-label="nav-item-Schemas"]').click();
    cy.contains('people');
    cy.contains('test-6.proto');
    cy.get('button[aria-label="expand-schema-people.proto"]').click({ force: true });
    cy.contains('message Person');
    if (isAdmin) {
      cy.get('button[aria-label="create-schema-button"]').should('exist');
      cy.get('button[aria-label="edit-button-schema-people.proto"]').should('exist');
      cy.get('button[aria-label="delete-button-schema-people.proto"]').should('exist');
    } else {
      cy.get('button[aria-label="create-schema-button"]').should('not.exist');
      cy.get('button[aria-label="edit-button-schema-people.proto"]').should('not.exist');
      cy.get('button[aria-label="delete-button-schema-people.proto"]').should('not.exist');
    }
  }

  function checkCountersPageView() {
    //Checking counters page
    cy.get('a[aria-label="nav-item-Counters"]').click();
    cy.contains('strong-1');
    cy.get('#counterFilterSelect').should('exist');
    cy.contains('td', 'strong-1').parent()
      .within($tr => {                       
        cy.get('td button').should('exist');
        cy.get('td button').click();
        cy.get('[data-cy=deleteCounter]').should('exist');
      });
  }

  function checkActionsOnSuperCache() {
    //Checking that user may create/edit/delete entries
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#key-entry').click().type('fordCar');
    cy.get('#valueContentType').click();
    cy.get('[id="Custom Type"]').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Car","name": "Ford","year": 2012,"number": "1BC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache super-cache.');
    cy.get('[data-cy=actions-fordCar]').should('exist');
    //Adding one more entry
    cy.get('[data-cy=addEntryButton]').click();
    cy.get('#key-entry').click().type('kiaCar');
    cy.get('#valueContentType').click();
    cy.get('[id="Custom Type"]').click();
    cy.get('#value-entry')
      .click()
      .type('{"_type": "org.infinispan.Car","name": "Kia","year": 2017,"number": "2AC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry added to cache super-cache.');
    cy.get('[data-cy=actions-kiaCar]').should('exist');
    //Editing entry
    cy.get('[data-cy=actions-kiaCar]').click();
    cy.get('[data-cy=editEntryAction]').click();
    cy.get('#value-entry')
      .click()
      .clear()
      .type('{"_type": "org.infinispan.Car","name": "Kia","year": 2016,"number": "2AC1898"}', {
        parseSpecialCharSequences: false
      });
    cy.get('[data-cy=addButton]').click();
    cy.contains('Entry updated in cache super-cache.');
    cy.contains('2016');
    //Deleting entry
    cy.get('[data-cy=actions-kiaCar]').click();
    cy.get('[data-cy=deleteEntryAction]').click();
    cy.get('[data-cy=deleteEntryButton]').click();
    cy.contains('Entry kiaCar deleted.');
    cy.contains('2AC1898').should('not.exist');
    //Running query
    cy.get('[data-cy=queriesTab]').click();
    cy.get('#textSearchByQuery').click().type('from org.infinispan.Car where year>2010');
    cy.get('[data-cy=searchButton]').click();
    cy.contains('1 - 1 of 1');
    cy.contains('Ford');
    //Reseting cache state for next test
    cy.get('[data-cy=manageEntriesTab]').click();
    cy.get('[data-cy=clearAllButton]').click();
    cy.get('[data-cy=deleteButton]').click();
  }

  function checkTasksPage() {
    //Checking Tasks page
    cy.get('a[aria-label="nav-item-Tasks"]').click();
    cy.contains('hello');
  }
});

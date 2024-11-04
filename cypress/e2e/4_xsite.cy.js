describe('XSite Config Tests', () => {
  beforeEach(() => {
    // Makes sure xsite-cache does not exist in LON
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      '/caches/xsite-cache');

    // Makes sure xsite-cache does not exist in NYC
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      'http://localhost:31222/rest/v2/caches/xsite-backup');

    // Make sure xsiteCache does not contain stringKey in LON or NYC
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/xsiteCache/stringKey');
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), 'http://localhost:31222/rest/v2/caches/xsiteCache/stringKey');

    // Make sure key3 has value3
    const value3 = {
      _type: 'string',
      _value: 'value3'
    };
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/xsiteCache/key3', 'PUT', value3, true);
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), 'http://localhost:31222/rest/v2/caches/xsiteCache/key3', 'PUT', value3, true);

    // Make sure key5 has value5 and exists
    const value5 = {
      _type: 'string',
      _value: 'value5'
    };
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/xsiteCache/key5', 'POST', value5, true);
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), 'http://localhost:31222/rest/v2/caches/xsiteCache/key5', 'POST', value5, true);

    // Make sure backup NYC is online
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/xsiteCache/x-site/backups/NYC?action=bring-online', 'POST');

    // Make sure state is clear
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'), '/caches/xsiteCache/x-site/local?action=clear-push-state-status', 'POST', '');
  });

  it('successfully shows the site name on data container page in LON', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.contains("LON");
    //Going to next page for checking xsite caches.
    cy.get('[data-action=next]').first().click();
    cy.contains("xsiteCache");
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit("/", {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains("NYC");
      cy.contains("xsiteCache");
    })
  });

  it('successfully shows the site name on data container page in NYC', () => {
    cy.origin('http://localhost:31222/console/', () => {
      cy.visit("/", {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains("NYC");
      cy.contains("xsiteCache");
    })
  });

  it('successfully views the Manage Backup pages.', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/xsiteCache');
    cy.contains("Backups");
    cy.contains('1 - 5 of 5');
    cy.get('[data-cy="detailCacheActions"]').click();
    cy.get("[data-cy=manageBackupsLink]").click();
    cy.contains("Backups management");
    cy.contains("NYC");
    cy.contains("Take offline");
    cy.get("[data-cy=NYC-startTransfer]").should("exist");

    cy.origin('http://localhost:31222/console/', () => {
      cy.visit("/", {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        },
        auth: {
          username: Cypress.env('username'),
          password: Cypress.env('password')
        }
      });
      cy.get('[data-cy=sideBarToggle]').click();
      cy.contains("NYC");
      cy.contains("xsiteCache").click();
      cy.contains('1 - 5 of 5');
      cy.contains("Backups").should('not.exist');
      cy.get('[data-cy="detailCacheActions"]').click();
      cy.get("[data-cy=manageBackupsLink]").should('not.exist');
    })
  });

  it('successfully creates cache with backup called xsite-cache', () => {
      cy.login(Cypress.env('username'), Cypress.env('password'));

      cy.on("uncaught:exception", (err, runnable) => {
        cy.log(err.message);
        return false;
      });

      cy.get('[data-cy=localSite]').should('exist');
      cy.contains("LON");

      //Going to create cache page
      cy.get('[data-cy=createCacheButton]').click();
      cy.get('#cache-name').click();
      cy.get('#cache-name').type('xsite-cache');
      cy.get('#configure').click();
      cy.get('[data-cy=wizardNextButton]').click();
      cy.get('#sync').click();
      cy.get('[data-cy=wizardNextButton]').click();

      //Filling backup cache properties
      cy.get('[data-cy=menu-toogle-featuresSelect]').click();
      cy.get('[data-cy=option-typeahead-BACKUPS]').click();

      cy.contains("Backups for LON");
      cy.get('[data-cy="menu-toogle-sitesSelector"]').click();
      cy.get('#nyc').click();
      cy.get("#sync-0").click();
      cy.get("#backupfor").click({force: true});
      cy.get("[data-cy=remote-cache-input]").type("xsite-backup");
      cy.get('[data-cy=toggle-remoteSiteSelector]').click();
      cy.get("#option-nyc").click();
      cy.get('[data-cy=wizardNextButton]').click();
      cy.contains("Adjust settings for cache backups");
      //Filling backup cache tuning properties
      cy.get("[data-cy=merge-policy-input]").type("DEFAULT");
      cy.get("[data-cy=maxCleanupDelay]").type("3000");
      cy.get("[data-cy=tombstone-map-size-input]").type("5120");
      cy.get("[id^=form-field-group-toggle]").click();
      cy.get("#twoPhaseCommit").click({force: true});
      cy.get("[data-cy=toggle-failurePolicy]").click();
      cy.get('[data-cy=option-WARN]').click();
      cy.get("[data-cy=timeout]").type(10000);
      cy.get('[data-cy="afterFailuresInput"]').type(10);
      cy.get('[data-cy="minwait"]').type(50000);
      cy.get('[data-cy="manual-radio"]').click();
      cy.get('[data-cy="chunckSizeInput"]').type(256);
      cy.get('[data-cy="timeoutStateTransfer"]').type(60000);
      cy.get('[data-cy="maxRetriesInput"]').type(25);
      cy.get('[data-cy="waitTime"]').type(1000);
      cy.get('[data-cy=wizardNextButton]').click();
      cy.get('[data-cy=wizardNextButton]').click(); //Saving the cache
      cy.get('[data-action=next]').first().click();
      cy.get('[data-cy="detailButton-xsite-cache"]').click();
      cy.contains('The cache is empty');
      cy.get('[data-cy="detailCacheActions"]').click();
      cy.get("[data-cy=manageBackupsLink]").click();
      cy.contains('Take offline');
      cy.origin('http://localhost:31222/console/', () => {
            cy.visit("/", {
                headers: {
                  'Accept-Encoding': 'gzip, deflate, br'
                },
                auth: {
                  username: Cypress.env('username'),
                  password: Cypress.env('password')
                }
              });
            cy.get('[data-cy=sideBarToggle]').click();
            cy.contains("NYC");
            cy.contains("xsiteCache");
            //Going to create cache page
            cy.get('[data-cy=createCacheButton]').click();
            cy.get('#cache-name').click();
            cy.get('#cache-name').type('xsite-backup');
            cy.get('#configure').click();
            cy.get('[data-cy=wizardNextButton]').click();
            cy.get('#async').click();
            cy.get('[data-cy=wizardNextButton]').click();

            //Filling backup cache properties
            cy.get('[data-cy=menu-toogle-featuresSelect]').click();
            cy.get('[data-cy=option-typeahead-BACKUPS]').click();
            cy.contains("Backups for NYC");
            cy.get('[data-cy="menu-toogle-sitesSelector"]').click();
            cy.get('#lon').click();
            cy.get("#async-0").click();
            cy.get('[data-cy=wizardNextButton]').click();
            cy.get('[data-cy=wizardNextButton]').click();
            cy.get('[data-cy=wizardNextButton]').click(); //Saving cache
            cy.get('[data-cy="detailButton-xsite-backup"]').click();
            cy.contains("Backups");
            cy.get('[data-cy="detailCacheActions"]').click();
            cy.get("[data-cy=manageBackupsLink]").click();
            cy.contains("Backups management");
            cy.contains("LON");
            cy.contains("Take offline");
            //Going back to cache details page
            cy.get("[data-cy=backButton]").click();

            //Adding new entry
            cy.get('[data-cy=addEntryButton]').click();
            cy.get('#key-entry').click().type('key1');
            cy.get('#value-entry').click().type('value1');
            cy.get('[data-cy=addButton]').click();
            cy.contains('Entry added to cache xsite-backup.');
            cy.contains('key1');
            cy.contains('value1');
        })
      cy.wait(2000); // wait 2s
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/xsite-cache');
      //Verifying that entries entered in NYC were successfully synced to LON
      cy.contains('key1');
      cy.contains('value1');
    });

    it('successfully takes offline NYC, adds/updates/deletes data, verifies that NYC does not cache, brings NYC online and checks the changes are transferred', () => {
        // log LON xsiteCache
        cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/xsiteCache');
        //Going to manage Backups page and taking the backup site offline
        cy.get('[data-cy="detailCacheActions"]').click();
        cy.get("[data-cy=manageBackupsLink]").click();
        cy.contains("Take offline");
        cy.get("#NYC-switch").click({force: true});
        cy.contains("Operation take offline on site NYC has started.");
        cy.contains("Bring online");

        //Going back to cache details page
        cy.get("[data-cy=backButton]").click();

        //Editing entry
        cy.get('[data-cy=actions-key3]').click();
        cy.get('[aria-label=editEntryAction]').click();
        cy.get("#value-entry").type("1");
        cy.get("[data-cy=addButton]").click();
        cy.contains("value31");

        //Deleting entry
        cy.get("[data-cy=actions-key5]").click();
        cy.get('[aria-label=deleteEntryAction]').click();
        cy.get('[data-cy=deleteEntryButton]').click();

        //Adding new entry
        cy.get('[data-cy=addEntryButton]').click();
        cy.get('#key-entry').click().type('stringKey');
        cy.get('#value-entry').click().type('stringValue');
        cy.get('[data-cy=addButton]').click();
        cy.contains('Entry added to cache xsiteCache.');
        cy.get('[name=close-alert-button]').click({ multiple: true }); //Closing alert popup.
        cy.contains('stringKey');
        cy.contains('stringValue');

        //Verifying that as the backup site is taken offline neither of the changes is visible on the backup site.
        cy.origin('http://localhost:31222/console/', () => {
            cy.visit("/", {
                headers: {
                  'Accept-Encoding': 'gzip, deflate, br'
                },
                auth: {
                  username: Cypress.env('username'),
                  password: Cypress.env('password')
                }
              });
            cy.get('[data-cy=sideBarToggle]').click();
            cy.contains("NYC");
            cy.contains("xsiteCache").click();
            cy.contains('1 - 5 of 5');
            cy.contains("stringKey").should("not.exist");
            cy.contains("key5");
            cy.contains("value31").should("not.exist");
        });

      // Now take NYC online, and check the values
      cy.login(Cypress.env('username'), Cypress.env('password'), '/cache/xsiteCache/backups');
      cy.contains("Bring online");
      cy.get("#NYC-switch").click({force: true});
      cy.contains("Operation bring online on site NYC has started.");
      cy.contains("Take offline");
      //Starting state transfer
      cy.get("[data-cy=NYC-startTransfer]").click();
      cy.contains("Are you sure you want to start a state transfer?");
      cy.get("[data-cy=startTransferButton]").click();
      cy.contains("Operation state transfer on site NYC has started.");
      cy.contains("Transfer Ok");
      cy.contains("Clear state");   //NYC-clearStateButton
      cy.get("[data-cy=NYC-clearStateButton]").click();

      // clear state
      cy.contains("Operation clear state transfer state on site NYC has started.");
      cy.contains("Transfer Ok").should("not.exist");
      cy.contains("Clear state").should("not.exist");
      cy.contains("Start transfer");

      //Verifying that as the backup site is taken offline neither of the changes is visible on the backup site.
      cy.origin('http://localhost:31222/console/', () => {
        cy.visit("/", {
          headers: {
            'Accept-Encoding': 'gzip, deflate, br'
          },
          auth: {
            username: Cypress.env('username'),
            password: Cypress.env('password')
          }
        });
        cy.get('[data-cy=sideBarToggle]').click();
        cy.contains("NYC");
        cy.contains("xsiteCache").click();
        cy.contains('1 - 6 of 6');
        cy.contains("stringKey");
        cy.contains("key5"); //The key5 should still be there as the state transfer doesn't include the entry deletions;
        cy.contains("value31");
      });
    });
});


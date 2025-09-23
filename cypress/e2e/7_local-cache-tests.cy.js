import { CONF_MUTABLE_SECURITY_AUTHORIZATION_ROLES } from '../../src/services/cacheConfigUtils';

describe('Local Cache Deployment', () => {
  before(() => {
    // Remove Cache if exists
    cy.cleanupTest(Cypress.env('username'), Cypress.env('password'),
      '/caches/local-test-cache', 'DELETE', '', true, '41222');
  });

  it('successfully navigates through menu', () => {
      //Visiting Data Container page
      cy.origin('http://localhost:41222/console/', () => {
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
        cy.contains('Running');
        cy.contains('Tracing is enabled');
        cy.contains('No caches');
      });

        //Visiting Global statistics page
      cy.origin('http://localhost:41222/console/global-stats', () => {
          cy.visit("/", {
            headers: {
              'Accept-Encoding': 'gzip, deflate, br'
            },
            auth: {
              username: Cypress.env('username'),
              password: Cypress.env('password')
            }
          });
          cy.contains('Cluster-wide statistics');
       });

        //Visiting Cluster Membership page
        cy.origin('http://localhost:41222/console/cluster-membership', () => {
          cy.visit("/", {
            headers: {
              'Accept-Encoding': 'gzip, deflate, br'
            },
            auth: {
              username: Cypress.env('username'),
              password: Cypress.env('password')
            }
          });
          cy.contains('1 member in use');
          cy.contains('local');
        });

        //Visiting Access Management page
        cy.origin('http://localhost:41222/console/access-management', () => {
          cy.visit("/", {
            headers: {
              'Accept-Encoding': 'gzip, deflate, br'
            },
            auth: {
              username: Cypress.env('username'),
              password: Cypress.env('password')
            }
          });
          cy.contains('observer');
        });

        //Visiting Connected clients page
        cy.origin('http://localhost:41222/console/connected-clients', () => {
          cy.visit("/", {
            headers: {
              'Accept-Encoding': 'gzip, deflate, br'
            },
            auth: {
              username: Cypress.env('username'),
              password: Cypress.env('password')
            }
          });
          cy.contains('Server node')
        });
   });

  it('successfully creates cache with all building options', () => {
    cy.on("uncaught:exception", (err, runnable) => {
        cy.log(err.message);
        return false;
      });
    cy.origin('http://localhost:41222/console/', () => {
        cy.visit("/", {
          headers: {
            'Accept-Encoding': 'gzip, deflate, br'
          },
          auth: {
            username: Cypress.env('username'),
            password: Cypress.env('password')
          }
        });
    cy.contains('local');
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('local-test-cache');
    cy.get('#configure').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('[data-cy=wizardNextButton]').click();

    //Filling bounded  cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-BOUNDED]').click();

    cy.get('#size').click();
    cy.get('[data-cy=memorySizeInput]').clear().type('1');
    cy.get('[data-cy=toggle-memorySizeUnit]').click();
    cy.get('#option-KB').click();
    cy.get('[data-cy=toggle-evictionStrategy]').click();
    cy.get('#option-REMOVE').click();

    //Filling indexed cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-INDEXED').click();
    cy.get('#persistent').click();
    cy.get('#auto').click();
    cy.get('#volatile').click();
    cy.get('[data-cy=toggle-startupModeSelector]').click();
    cy.get('#option-reindex').click();
    cy.get('[data-cy=toggle-startupModeSelector]').click();
    cy.get('[data-cy=indexSharding]').type(10);
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    cy.get('[data-cy=menu-toogle-entitiesSelector]').click().type('org.infinispan.Person').type('{enter}');
    cy.get('[data-cy=menu-toogle-entitiesSelector]').click()

    //Filling auth cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-SECURED]').click();
    cy.get('[data-cy=menu-toogle-roleSelector]').click();
    cy.get('[data-cy=option-typeahead-admin]').click();
    cy.get('[data-cy=option-typeahead-application]').click();
    cy.get('[data-cy=option-typeahead-deployer]').click();
    cy.get('[data-cy=menu-toogle-roleSelector]').click();

    //Filling persistant cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-PERSISTENCE]').click();
    cy.get('[data-cy=passivationSwitch]').next().click();
    cy.get('[data-cy=connectionAttempts]').type(5);
    cy.get('[data-cy=connectionInterval]').type(60);
    cy.get('[data-cy=availabilityInterval]').type(5000);
    cy.get('#toggle-persistentStorage').click();
    cy.get('#option-FileStore').click();

    //Filling transactional cache properties
    cy.get('[data-cy=menu-toogle-featuresSelect]').click();
    cy.get('[data-cy=option-typeahead-TRANSACTIONAL]').click();
    cy.get('#non_xa').click();

    cy.get('#pessimistic').click();
    cy.get('[data-cy=wizardNextButton]').click();

    cy.get('[data-cy=toggle-storage]').click();
    cy.get('#option-HEAP').click();
    cy.get('[data-cy=concurencyLevel]').clear().type(40);
    cy.get('[data-cy=lockTimeout]').clear().type(15);
    cy.get('#striping').next().click();
    //Indexing tuning
    cy.get('[data-cy=indexReaderExpand] button').click();
    cy.get('[data-cy=refreshInterval]').type(10);
    cy.get('[data-cy=indexWriterExpand] button').click();
    cy.get('#low-level-trace').next().click();
    cy.get('[data-cy=commitInterval]').type(1001);
    cy.get('[data-cy=ramBufferSize]').type(33);
    cy.get('[data-cy=maxBufferedEntries]').type(33);
    cy.get('[data-cy=threadPoolSize]').type(10);
    cy.get('[data-cy=queueCount]').type(10);
    cy.get('[data-cy=queueSize]').type(1050);
    cy.get('[data-cy=indexMerge] button').click();
    cy.get('#calibrate-by-deletes').next().click();
    cy.get('[data-cy=factor]').type(10);
    cy.get('[data-cy=maxEntries]').type(1000);
    cy.get('[data-cy=minSize]').type(1000);
    cy.get('[data-cy=maxSize]').type(10000);
    cy.get('[data-cy=maxForcedSize]').type(10000);
    //Transaction tuning
    cy.get('#read-committed').click();
    cy.get('[data-cy=stopTimeout]').type(10000);
    cy.get('[data-cy=completeTimeout]').type(50000);
    cy.get('[data-cy=reaperInterval]').type(20000);

    //Filling tracing properties
     cy.get('[data-cy=menu-toogle-categorySelector]').click();
     cy.get('[data-cy=option-typeahead-persistence]').click();
     cy.get('[data-cy=menu-toogle-categorySelector]').click();

    //Filling alias
    cy.get('[data-cy=menu-toogle-aliasesSelector]').click().type('localAlias').type('{enter}');

    // Next
    cy.get('[data-cy=wizardNextButton]').click();

    //Verify before submitting and downloading file
    cy.contains('local-test-cache');
    cy.get('[data-cy=downloadModal]').click();
    cy.get('[data-cy=downloadButton]').click();
    cy.wait(2000);
    let downloadedFile = cy.readFile('./cypress/downloads/local-test-cache.json');
    downloadedFile.should('exist');
    downloadedFile.its('local-cache.aliases').should('exist');

    cy.get('[data-cy=downloadModal]').click();
    cy.get('#modal-XML').click();
    cy.get('[data-cy=downloadButton]').click();
    cy.wait(2000);
    downloadedFile = cy.readFile('./cypress/downloads/local-test-cache.xml');
    downloadedFile.should('exist');

    cy.get('[data-cy=downloadModal]').click();
    cy.get('#modal-YAML').click();
    cy.get('[data-cy=downloadButton]').click();
    downloadedFile = cy.readFile('./cypress/downloads/local-test-cache.yaml');
    downloadedFile.should('exist');

    cy.get('[data-cy=wizardNextButton]').click();

    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('[data-ouia-component-id=cluster-manager-header-title]').should('not.exist');
    cy.get('[data-cy="statusInfo-clusterManager"]').should('not.exist');
    cy.get('[data-cy=rebalancingSwitch]').should('not.exist');
    cy.contains('local-test-cache');
    cy.contains('localAlias');
    cy.get('[data-cy=feature-local-test-cache]').contains('Bounded');
    cy.get('[data-cy=feature-local-test-cache]').contains('Indexed');
    cy.get('[data-cy=feature-local-test-cache]').contains('Secured');
    cy.get('[data-cy=feature-local-test-cache]').contains('Persistent');
    cy.get('[data-cy=feature-local-test-cache]').contains('Transactional');
    });
  });
});

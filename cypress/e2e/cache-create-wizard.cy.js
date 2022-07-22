function createRandomCacheName() {
  return (Math.random() + 1).toString(36).substring(3);
}

describe('Cache Creation Wizard', () => {

  beforeEach(() => {
    cy.login(Cypress.env("username"), Cypress.env("password"));
  })

  it('successfully creates cache with all building options', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('super-cache');
    cy.get('#configure').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('#sync').click();
    cy.get('[data-cy=wizardNextButton]').click();
    
    //Filling bounded  cache properties
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('boun');
    cy.get('#BOUNDED > button').click();
    cy.get('#size').click();
    cy.get('[data-cy=memorySizeInput]').clear().type('1');
    cy.get('#memorySizeUnit').click();
    cy.get('#KB').click();
    cy.get('#evictionStrategy').click();
    cy.get('#REMOVE').click();

    //Filling indexed cache properties  
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('ind');
    cy.get('#INDEXED > button').click();
    cy.get('#persistent').click();
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    cy.get('#entitiesSelector').click();
    cy.get('[id$="org.infinispan.Person"]').click();

    //Filling auth cache properties
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('auth');
    cy.get('#SECURED > button').click();
    cy.get('#roleSelector-select-multi-typeahead-typeahead').click().type('admin');
    cy.get('#admin > button').click();
    cy.get('#roleSelector-select-multi-typeahead-typeahead').click().type('observer');
    cy.get('#observer > button').click();

    //Filling persistant cache properties
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('pers');
    cy.get('#PERSISTENCE > button').click();
    cy.get('[data-cy=passivationSwitch]').next().click();
    cy.get('[data-cy=connectionAttempts]').type(5);
    cy.get('[data-cy=connectionInterval]').type(60);
    cy.get('[data-cy=availabilityInterval]').type(5000);
    cy.get('#persistentStorage').click();
    cy.get('#FileStore').click();
    
    //Filling transactional cache properties
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('trans');
    cy.get('#TRANSACTIONAL > button').click();
    cy.get('#non_xa').click();
    cy.get('#pessimistic').click();
    cy.get('[data-cy=wizardNextButton]').click();
    
    cy.get("#storageSelector").click();
    cy.get('#HEAP').click();
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
    cy.get('[data-cy=wizardNextButton]').click();
  
    //Verify before submitting and downloading file
    cy.contains('super-cache');
    cy.get('[data-cy=downloadButton]').click();
    cy.wait(2000);
    var downloadedFile = cy.readFile('./cypress/downloads/super-cache.json');
    downloadedFile.should('exist');
    downloadedFile.its('distributed-cache.mode').should('eq', 'SYNC');

    cy.get('#downloadType').click();
    cy.get('#XML').click();
    cy.get('[data-cy=downloadButton]').click();
    downloadedFile = cy.readFile('./cypress/downloads/super-cache.xml');
    downloadedFile.should('exist');

    cy.get('#downloadType').click();
    cy.get('#YAML').click();
    cy.get('[data-cy=downloadButton]').click();
    downloadedFile = cy.readFile('./cypress/downloads/super-cache.yaml');
    downloadedFile.should('exist');
    
    cy.get('[data-cy=wizardNextButton]').click();
  
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.get('[data-action=next]').click();
    cy.contains('super-cache');
    cy.get('[data-cy=feature-super-cache]').contains('Bounded');
    cy.get('[data-cy=feature-super-cache]').contains('Indexed');
    cy.get('[data-cy=feature-super-cache]').contains('Secured');
    cy.get('[data-cy=feature-super-cache]').contains('Persistent');
    cy.get('[data-cy=feature-super-cache]').contains('Transactional');
  })
});

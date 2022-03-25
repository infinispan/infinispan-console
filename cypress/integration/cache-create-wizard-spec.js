describe('Cache Creation Wizard', () => {

    beforeEach(() => {
      cy.login(Cypress.env("username"), Cypress.env("password"));
    })

    //Exists the cache editor with Cancel button and breadcrumb link
  it('exits cache creator with Cancel button and breadcrumb link.', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aCache');
    cy.get('[data-cy=cancelWizard]').click();
  
    //Is redirected to Data Container page
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aCache').should('not.exist');
  
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aCache');
    cy.get('[data-cy=dataContainerLink]').click(); //Clicking on breadcrumb link.
  
    //Is redirected to Data Container page
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aCache').should('not.exist');
  })
  
  //Exists the cache editor with Cancel and back buttons
  it('exits cache creator with Cancel and back buttons', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#edit').click();
    //Checking that the Next button is disabled until the cache name is entered
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');
  
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aCache');
  
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get('#template-selector').click();
    cy.contains('e2e-test-template').parent().find('button').click();
    cy.get('[data-cy=cancelWizard]').click();
    //Is redirected to DataContainer page.
    cy.get('#cluster-manager-header').should('exist');
  
    //Going again to cache create page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#edit').click();
    //Checking that the Next button is disabled until the cache name is entered
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');
  
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aCache');
    //Going to 2nd page again
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('#template-selector').click();
    cy.contains('e2e-test-template').parent().find('button').click();
    cy.get('[data-cy=wizardBackButton]').click();
    cy.get('[data-cy=cancelWizard]').click();
  
    //Is redirected to Data Container page
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aCache').should('not.exist');
  })
  
  //Data Container create cache in editor with template
   it('successfully creates with a template', () => {
      //go to create cache page
      cy.get('[data-cy=createCacheButton]').click();
      cy.get('#edit').click();
      //Checking that the Next button is disabled until the cache name is entered
      cy.get('[data-cy=wizardNextButton]').should('be.disabled');
  
      cy.get('#cache-name').click();
      cy.get('#cache-name').type('aCache');
  
      cy.get('[data-cy=wizardNextButton]').click();
  
      cy.get('#template-selector').click();
      cy.contains('e2e-test-template').parent().find('button').click();
      cy.get('[data-cy=wizardNextButton]').click();
      // Once the cache created, redirection to main page is done and the cache should be visible
      //Is redirected to Data Container page
      cy.get('#cluster-manager-header').should('exist');
      cy.get('[data-cy=cacheManagerStatus]').should('exist');
      cy.get('[data-cy=rebalancingSwitch]').should('exist');
      cy.contains('aCache');
   })
  
   //Create cache with duplicate name;
   it('fails to create cache with duplicate name', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#edit').click();
    
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aCache');
  
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    cy.get('#cache-name-helper').should('exist');
  
    cy.get('#cache-name').clear();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('aCache1');
    cy.get('#cache-name-helper').should('not.exist');
  
    cy.get('[data-cy=cancelWizard]').click();
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aCache1').should('not.exist');
  })
  
   //Data Container create cache in editor without template
   it('successfully creates without a template', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('b-cache');
    cy.get('#edit').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('.pf-c-expandable-section__toggle-text').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('aCache');
    cy.contains('b-cache');
  })
    //Data Container testing bounded cache creation wizard
 it('successfully creates bounded cache with memory size', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('bounded-cache-memory');
    cy.get('#configure').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get('#cacheEncoding').click();
    cy.get('#Text > button').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('boun');
    cy.get('#BOUNDED > button').click();
    cy.get('#size').click();
    cy.get('[data-cy=memorySizeInput]').clear().type('1');
    cy.get('#memorySizeUnit').click();
    cy.get('#KB').click();
    cy.get('#evictionStrategy').click();
    cy.get('#REMOVE').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get("#storageSelector").click();
    cy.get('#HEAP').click();
    cy.get('[data-cy=concurencyLevel]').clear().type(40);
    cy.get('[data-cy=lockTimeout]').clear().type(15);
    cy.get('[data-cy=wizardNextButton]').click();
  
    //Verify before submitting
    cy.contains('bounded-cache-memory');
    cy.get('[data-cy=wizardNextButton]').click();
  
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('bounded-cache-memory');
    //Verifying that 'Bounded' badge is shown. @TODO uncomment this when issue ISPN-13889 is fixed
    cy.get('[data-cy=feature-bounded-cache-memory]').contains('Bounded');
  })
  
  //Data Container testing bounded cache creation wizard 1
  it('successfully creates bounded cache with max entries size', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('bounded-cache-size');
    cy.get('#configure').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get('#cacheEncoding').click();
    cy.get('#Text > button').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('boun');
    cy.get('#BOUNDED > button').click();
    cy.get('#count').click();
    cy.get('[data-cy="memorySizeMaxCount"]').type('10');
    cy.get('#evictionStrategy').click();
    cy.get('#EXCEPTION').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get("#storageSelector").click();
    cy.get('#OFF_HEAP').click();
    cy.get('[data-cy=concurencyLevel]').clear().type(40);
    cy.get('[data-cy=lockTimeout]').clear().type(5);
    cy.get('#striping').next().click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    //Verify before submitting
    cy.contains('bounded-cache-size');
    cy.get('[data-cy=wizardNextButton]').click();
    cy.contains('ISPN000513', {timeout: 10000}).should('not.exist');
    
    //Going back and choosing other eviction strategy
    cy.get('[data-cy=wizardBackButton]').click();
    cy.get('[data-cy=wizardBackButton]').click();
    cy.get('#evictionStrategy').click();
    cy.get('#REMOVE').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('bounded-cache-size');
    //Verifying that 'Bounded' badge is shown. @TODO uncomment this when issue ISPN-13889 is fixed
    cy.get('[data-cy=feature-bounded-cache-size]').contains('Bounded');
  })

  //Data Container testing auth cache creation wizard 1
  it('successfully creates auth cache with selected roles', () => {
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#cache-name').click();
    cy.get('#cache-name').type('auth-cache');
    cy.get('#configure').click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get('#cacheEncoding').click();
    cy.get('#Text > button').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('auth');
    cy.get('#SECURED > button').click();
    cy.get('#roleSelector').click();
    cy.get('#observer').click();
    cy.get('#monitor').click();
    cy.get('#deployer').click();
    cy.get('#roleSelector').click().blur();
    cy.contains('observer');
    cy.contains('monitor');
    cy.get('[data-cy=monitor] > button').click();
    cy.get('[data-cy=monitor]').should('not.exist');
    cy.get('[data-cy=observer]').should('exist');
    cy.get('[data-cy=deployer]').should('exist');
    cy.get('[data-cy=wizardNextButton]').click();
  
    cy.get("#storageSelector").click();
    cy.get('#OFF_HEAP').click();
    cy.get('[data-cy=concurencyLevel]').clear().type(40);
    cy.get('[data-cy=lockTimeout]').clear().type(5);
    cy.get('#striping').next().click();
    cy.get('[data-cy=wizardNextButton]').click();
  
    //Verify before submitting
    cy.get('textarea').type('{pageDown}{downArrow}{downArrow}{downArrow}'); //scrolling in the text area so that cypress sees the whole text
    cy.contains('auth-cache');
    cy.contains('observer');
    cy.contains('deployer');
    cy.contains('monitor').should('not.exist');
    cy.get('[data-cy=wizardNextButton]').click();
    cy.contains('Cache auth-cache created with the provided configuration.', {timeout: 11000}).should('not.exist');
  
    // Once the cache created, redirection to main page is done and the cache should be visible
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains('auth-cache');
    cy.get('[data-cy=feature-auth-cache]').contains('Secured');
  })

    //Data Container testing auth cache creation wizard 2
    it('successfully creates auth cache with one selected role', () => {
      //go to create cache page
      cy.get('[data-cy=createCacheButton]').click();
      cy.get('#cache-name').click();
      cy.get('#cache-name').type('auth-cache-single-role');
      cy.get('#configure').click();
      cy.get('[data-cy=wizardNextButton]').click();
    
      cy.get('#cacheEncoding').click();
      cy.get('#Text > button').click();
      cy.get('[data-cy=wizardNextButton]').click();
      cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('auth');
      cy.get('#SECURED > button').click();
      cy.get('#roleSelector').click();
      cy.get('#observer').click();
      cy.get('#monitor').click();
      cy.get('#deployer').click();
      cy.get('#roleSelector').click().blur();
      cy.get('[data-cy=observer]').should('exist');
      cy.get('[data-cy=deployer]').should('exist');
      cy.get('[data-cy=monitor]').should('exist');

      cy.get('[data-cy=monitor] > button').click();
      cy.get('[data-cy=deployer] > button').click();
      cy.get('[data-cy=monitor]').should('not.exist');
      cy.get('[data-cy=observer]').should('exist');
      cy.get('[data-cy=deployer]').should('not.exist');
      cy.get('[data-cy=wizardNextButton]').click();
    
      cy.get("#storageSelector").click();
      cy.get('#OFF_HEAP').click();
      cy.get('[data-cy=concurencyLevel]').clear().type(40);
      cy.get('[data-cy=lockTimeout]').clear().type(5);
      cy.get('#striping').next().click();
      cy.get('[data-cy=wizardNextButton]').click();
    
      //Verify before submitting
      cy.contains('auth-cache-single-role');
      cy.contains('observer');
      cy.contains('deployer').should('not.exist');
      cy.contains('monitor').should('not.exist');
      
      cy.get('[data-cy=wizardNextButton]').click();
      cy.contains('Cache auth-cache-single-role created with the provided configuration.', {timeout: 11000}).should('not.exist');
      
      // Once the cache created, redirection to main page is done and the cache should be visible
      cy.get('#cluster-manager-header').should('exist');
      cy.get('[data-cy=cacheManagerStatus]').should('exist');
      cy.get('[data-cy=rebalancingSwitch]').should('exist');
      cy.contains('auth-cache-single-role');
      cy.get('[data-cy=feature-auth-cache-single-role]').contains('Secured');
    })

    it('not goes forward if security role is not chosen', () => {
      //go to create cache page
      cy.get('[data-cy=createCacheButton]').click();
      cy.get('#cache-name').click();
      cy.get('#cache-name').type('auth-cache-without-role');
      cy.get('#configure').click();
      cy.get('[data-cy=wizardNextButton]').click();
    
      cy.get('#cacheEncoding').click();
      cy.get('#Text > button').click();
      cy.get('[data-cy=wizardNextButton]').click();
      cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('auth');
      cy.get('#SECURED > button').click();
      cy.get('#roleSelector').click();

      cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    })

    // it('successully creates indexed cache', () => {
    //   //go to create cache page
    //   cy.get('[data-cy=createCacheButton]').click();
    //   cy.get('#cache-name').click();
    //   cy.get('#cache-name').type('indexed-cache1');
    //   cy.get('#configure').click();
    //   cy.get('[data-cy=wizardNextButton]').click();
    
    //   cy.get('#cacheEncoding').click();
    //   cy.get('#Text > button').click();
    //   cy.get('[data-cy=wizardNextButton]').click();
    //   cy.get('#featuresSelect-select-multi-typeahead-typeahead').click().type('ind');
    //   cy.get('#INDEXED > button').click();
    //   cy.get('#persistent').click();
    //   cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    //   cy.get('[data-cy=indexEntityInput]').type('org.infinispan.Person');
    //   cy.get('[data-cy=wizardNextButton]').should('be.disabled');
    //   cy.get('#add-entity').click();
    //   cy.get('[data-cy=org.infinispan.Person]').should('exist');
    //   cy.get('[data-cy=wizardNextButton]').click();


    // })
});
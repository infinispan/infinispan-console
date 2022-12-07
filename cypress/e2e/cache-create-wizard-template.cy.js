describe('Cache Creation Wizard', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
  });

  it('successfully creates with a template', () => {
    const cacheName = 'aCache';
    //go to create cache page
    cy.get('[data-cy=createCacheButton]').click();
    cy.get('#edit').click();
    //Checking that the Next button is disabled until the cache name is entered
    cy.get('[data-cy=wizardNextButton]').should('be.disabled');

    cy.get('#cache-name').click();
    cy.get('#cache-name').type(cacheName);

    cy.get('[data-cy=wizardNextButton]').click();

    cy.get('#template-selector').click();
    cy.contains('e2e-test-template').parent().find('button').click();
    cy.get('[data-cy=wizardNextButton]').click();
    cy.contains('Cache ' + cacheName + ' successfully created with e2e-test-template.');
    // Once the cache created, redirection to main page is done and the cache should be visible
    //Is redirected to Data Container page
    cy.get('#cluster-manager-header').should('exist');
    cy.get('[data-cy=cacheManagerStatus]').should('exist');
    cy.get('[data-cy=rebalancingSwitch]').should('exist');
    cy.contains(cacheName);
  });

  //   it.only('successfully creates without a template a JSON config', () => {
  //     //go to create cache page
  //     cy.get('[data-cy=createCacheButton]').click();
  //     cy.get('#cache-name').click();
  //     cy.get('#cache-name').type('aSimpleCache');
  //     cy.get('#edit').click();
  //     cy.get('[data-cy=wizardNextButton]').click();
  //     cy.get('[data-cy=provideConfigArea] > button').click();
  //     cy.get('.pf-c-code-editor__code textarea').clear({force: true});
  //     cy.get('.pf-c-code-editor__code textarea').type("{selectAll}", {force: true});
  //     cy.get('.pf-c-code-editor__code textarea').type("{backspace}");
  //     cy.get('[style="top:19px;height:19px;"] > :nth-child(1) > .mtk1').clear({force: true});
  //     cy.get('.pf-c-code-editor__code textarea').type('{selectall}{backspace}');
  //     cy.get('.pf-c-code-editor__code').type('{"distributed-cache": {"mode": "ASYNC", "statistics": true }    }', { delay: 100, parseSpecialCharSequences: false });
  //     // cy.get('[data-cy=wizardNextButton]').click();
  //     // cy.contains('Unexpected error creating the cache');

  //     cy.get('.pf-c-code-editor__code textarea').type("{selectAll}", {force: true});
  //     cy.get('.pf-c-code-editor__code textarea').type("{backspace}");

  //     cy.get('.pf-c-code-editor__code textarea').type('{selectall}{backspace}');
  //     // cy.readFile('data/caches/aSimpleCache.json').then((str) => {

  //     //   cy.get('.pf-c-code-editor__code textarea').type(JSON.stringify(str), { parseSpecialCharSequences: false });
  //     // })

  //     //cy.get('[data-cy=wizardNextButton]').click();
  //     //cy.contains('Cache simpleCache created with the provided configuration.');
  //     // Once the cache created, redirection to main page is done and the cache should be visible
  //     //cy.get('#cluster-manager-header').should('exist');
  //     //cy.get('[data-cy=cacheManagerStatus]').should('exist');
  //     //cy.get('[data-cy=rebalancingSwitch]').should('exist');
  //     //cy.contains('aSimpleCache');
  //   })

  //   it('successfully creates without a template a XML config', () => {
  //     //go to create cache page
  //     cy.get('[data-cy=createCacheButton]').click();
  //     cy.get('#cache-name').click();
  //     cy.get('#cache-name').type('aSimpleXmlCache');
  //     cy.get('#edit').click();
  //     cy.get('[data-cy=wizardNextButton]').click();
  //     cy.get('[data-cy=provideConfigArea] > button').click();

  //     cy.get('.pf-c-code-editor__code textarea').clear({force: true}).type('<local-cache name="evictionCache">\
  //     <expiration interval="500" lifespan="60000" max-idle="1000" touch="ASYNC"/>\
  //     <memory>\
  //        <object strategy="REMOVE" size="5000"/>\
  //     </memory>\
  //  </local-cache>', { parseSpecialCharSequences: false });
  //     cy.get('[data-cy=wizardNextButton]').click();
  //     cy.contains('Cache simpleCache created with the provided configuration.');
  //     // Once the cache created, redirection to main page is done and the cache should be visible
  //     cy.get('#cluster-manager-header').should('exist');
  //     cy.get('[data-cy=cacheManagerStatus]').should('exist');
  //     cy.get('[data-cy=rebalancingSwitch]').should('exist');
  //     cy.contains('aSimpleXmlCache');
  //   })
});

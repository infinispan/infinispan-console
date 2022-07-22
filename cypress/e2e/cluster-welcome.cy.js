describe('Welcome page', () => {
  it('successfully loads Welcome page', () => {
    cy.visit('/welcome', {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    cy.get('h2')
      .invoke('text')
      .should('match', /Welcome to .* Server/);
    cy.contains('Open the console');
  });

  it('successfully logs in and logs out', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));

    cy.contains('Default'); // cluster name
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.contains('19 Caches');
    cy.contains('10 Counters');
    cy.contains('1 Tasks');
    cy.contains('11 Schemas');
    cy.contains('invalidationCache');

    //Checks that user's dropbox exists on the page.
    cy.contains('admin').click();
    cy.contains('Logout').click();
    cy.get('h2')
      .invoke('text')
      .should('match', /Welcome to .* Server/);
    cy.contains('Open the console');
  });

  it('successfully opens and navigates side menu', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));

    cy.contains('Default'); // cluster name
    cy.contains('Running'); // cluster status

    //Checks if navigation menu is hidden
    cy.contains('Data Container').should('not.be.visible');
    cy.contains('Global Statistics').should('not.be.visible');
    cy.contains('Cluster Membership').should('not.be.visible');
    cy.contains('About').should('not.be.visible');

    cy.get('#nav-toggle').click();
    //Checks if navigation menu is visible
    cy.contains('Data Container').should('be.visible');
    cy.contains('Global Statistics').should('be.visible');
    cy.contains('Cluster Membership').should('be.visible');
    cy.contains('About').should('be.visible');

    //Clicks the About link and should go to About dialog
    cy.contains('About').click();
    cy.get('[role=dialog]').should('be.visible');
    cy.contains('Version');
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Red Hat Data Grid')) {
        //Checks if links from About dialog work properly
        cy.get('a[href*="github"').should('exist');
        cy.get('a[href*="zulipchat"').should('exist');
        cy.get('a[href*="stackoverflow"').should('exist');
        cy.get('a[href*="twitter"').should('exist');
        cy.get('a[href*="facebook"').should('exist');
      } else {
        cy.contains('Sponsored by Red Hat');
      }
    });
    cy.get('[aria-label="Close Dialog"]').click();
    cy.get('[role=dialog]').should('not.exist'); //Closes About dialog

    //Clicks the Cluster Membership link and should go to Cluster Membership page
    cy.contains('Cluster Membership').click();
    cy.contains('Cluster membership').should('be.visible');
    cy.contains('Healthy');
    cy.contains('infinispan-4-e2e');

    //Clicks the Global statistics link and should go to Global statistics page
    cy.contains('Global Statistics').click();
    cy.contains('Global statistics').should('be.visible');
    cy.contains('Cluster-wide statistics ');
    cy.contains('Cache Manager lifecycle values ');

    //Clicks the Data Container link and should go to Data Container page
    cy.contains('Data Container').click();
    cy.contains('Default').should('be.visible');
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
  });
});

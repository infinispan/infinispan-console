describe('Welcome page', () => {
  function clickSideBar() {
    cy.get('[data-cy=sideBarToggle]').click();
  }

  it('successfully loads Welcome page', () => {
    cy.visit('/welcome', {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    cy.get('h1')
    .invoke('text')
    .should('match', /.* Server.*/);
    cy.contains('Open the console');
  });

  it('successfully logs in and logs out', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));

    cy.contains('Data container');
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.contains('Tracing is enabled'); // tracing status
    cy.contains('16 Caches');
    cy.contains('10 Counters');
    cy.contains('1 Tasks');
    cy.contains('13 Schemas');
    cy.contains('invalidationCache');

    if (Cypress.browser.name === 'firefox') {
      cy.contains('admin');
      cy.get('[aria-label*="incognito"]').should('exist');
    } else {
      //Checks that user's dropbox exists on the page.
      cy.contains('admin').click();
      cy.contains('Logout').click();
      cy.get('h1')
      .invoke('text')
      .should('match', /.* Server.*/);
      cy.contains('Open the console');
    }
  });

  it('successfully opens and navigates side menu', () => {
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.contains('Data container');
    cy.contains('Running'); // cluster status
    // Show sidebar
    clickSideBar();
    //Checks if navigation menu is visible
    cy.contains('Data Container').should('be.visible');
    cy.contains('Global Statistics').should('be.visible');
    cy.contains('Cluster Membership').should('be.visible');
    cy.contains('Access Management').should('be.visible');
    cy.contains('Connected Clients').should('be.visible');

    //Clicks the side menu Data Container
    cy.get('[itemid="data_container"]').click();
    cy.contains('Data container');
    cy.contains('LON');
    cy.contains('Tracing is enabled');
    cy.contains('Cluster rebalancing on');

    //Clicks the side menu Global Statistics
    cy.get('[itemid="global_stats"]').click();
    cy.contains('Global statistics');

    //Clicks the side menu Cluster membership
    cy.get('[itemid="cluster_membership"]').click();
    cy.contains('Cluster membership');
    cy.contains('Running');
    cy.contains('1 member in use');

    //Clicks the side menu Access management
    cy.get('[itemid="access_management"]').click();
    cy.contains('Access management');
    cy.contains('admin');

    //Clicks the side menu Access management
    cy.get('[itemid="connected_clients"]').click();
    cy.contains('Connected clients');
    cy.contains('Server node');
  });

  it('successfully opens and views About page', () => {
      cy.login(Cypress.env('username'), Cypress.env('password'));
      cy.get('[data-cy=aboutInfoQuestionMark]').click();
      cy.contains('Documentation');

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
          cy.get('a[href*="x.com"').should('exist');
          cy.get('a[href*="facebook"').should('exist');
        } else {
          cy.contains('Sponsored by Red Hat');
        }
      });
      cy.get('[aria-label="Close Dialog"]').click();
      cy.get('[role=dialog]').should('not.exist'); //Closes About dialog
    });
});

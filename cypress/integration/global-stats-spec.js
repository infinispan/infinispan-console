describe('Global stats', () => {

  beforeEach(() => {
    cy.login(Cypress.env("username"), Cypress.env("password"), '/global-stats');
  })

  it('successfully loads Global stats', () => {
       cy.get('h1').should('contain', 'Global statistics')
       cy.get('h5').should('contain', 'Cluster-wide statistics')
       cy.get('h5').should('contain', 'Data access statistics')
       cy.get('h5').should('contain', 'Operation performance values')
       cy.get('h5').should('contain', 'Cache Manager lifecycle values')
    })

  //View all caches href
  it('successfully loads Global stats', () => {
    //click View all caches should navigate to console page
    cy.get('.pf-m-2-row .pf-c-button').click();

    //Verify that page is properly loaded after click;
    cy.get('h2').invoke('text').should('match', /Server .* Console/); // header
    cy.contains('Default'); // cluster name
    cy.contains('Running'); // cluster status
    cy.contains('Cluster rebalancing on'); // rebalancing status
    cy.contains('default'); // cache default
    cy.contains('java-serialized-cache'); 
   })

  //View Cluster Status href
  it('successfully loads Global stats', () => {
    //click View Cluster Status should navigate to cluster-membership page
    cy.get('.pf-l-grid__item:nth-child(3) .pf-c-button').click();

    //Verify that page is properly loaded after click;
    cy.get('h1').should('contain', 'Cluster membership');
    cy.contains('Healthy');
  })

});

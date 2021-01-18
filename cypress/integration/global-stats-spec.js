describe('Global stats', () => {
  it('successfully loads Global stats', () => {
       cy.visit('http://localhost:11222/console/global-stats', {
                headers: {
                  "Accept-Encoding": "gzip, deflate, br"
                }
       });
       cy.get('h1').should('contain', 'Global statistics')
       cy.get('h5').should('contain', 'Cluster Content')
       cy.get('h5').should('contain', 'Data access')
       cy.get('h5').should('contain', 'Operations Performance')
       cy.get('h5').should('contain', 'Cache Manager Lifecycle')
    })

  //View all caches href
  it('successfully loads Global stats', () => {
       cy.visit('http://localhost:11222/console/global-stats', {
                headers: {
                  "Accept-Encoding": "gzip, deflate, br"
                 }
       });
        //click View all caches should navigate to console page
        cy.get('.pf-m-2-row .pf-c-button').click();
        //back to cluster-membership
        cy.visit('http://localhost:11222/console/', {
        headers: {
                  "Accept-Encoding": "gzip, deflate, br"
                 }
        });
   })

  //View Cluster Status href
  it('successfully loads Global stats', () => {
        cy.visit('http://localhost:11222/console/global-stats', {
                 headers: {
                    "Accept-Encoding": "gzip, deflate, br"
                  }
        });
        //click View Cluster Status should navigate to cluster-membership page
        cy.get('.pf-l-grid__item:nth-child(3) .pf-c-button').click();
        //back to cluster-membership
        cy.visit('http://localhost:11222/console/cluster-membership', {
        headers: {
                  "Accept-Encoding": "gzip, deflate, br"
                 }
        });
  })

});

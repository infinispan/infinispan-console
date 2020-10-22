describe('Global stats', () => {
  it('successfully loads Global stats', () => {
       cy.visit('http://localhost:11222/console/global-stats')
       cy.get('h1').should('contain', 'Global statistics')
       cy.get('h5').should('contain', 'Cluster Content')
       cy.get('h5').should('contain', 'Data access')
       cy.get('h5').should('contain', 'Operations Performance')
       cy.get('h5').should('contain', 'Cache Manager Lifecycle')
    })
});

describe('Cluster Membership', () => {
  it('successfully loads Cluster Membership', () => {
       cy.visit('http://localhost:11222/console/cluster-membership')
       cy.get('h1').should('contain', 'Cluster Membership')
    })
});

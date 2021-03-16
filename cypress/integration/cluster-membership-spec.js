describe('Cluster Membership', () => {
  it('successfully loads Cluster Membership', () => {
      cy.visit('http://localhost:11222/console/cluster-membership', {
               headers: {
                "Accept-Encoding": "gzip, deflate, br"
               }
      });
      cy.get('h1').should('contain', 'Cluster membership');
    })
});

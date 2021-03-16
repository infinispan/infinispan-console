describe('Welcome page', () => {
  it('successfully loads Welcome page', () => {
    cy.visit('http://localhost:11222/console/welcome', {
             headers: {
                       "Accept-Encoding": "gzip, deflate, br"
             }
            });
    cy.get('h2').should('contain', 'Welcome to Infinispan Server');
  });
});

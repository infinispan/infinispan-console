
describe('Cache Templates Overview', () => {
 it('successfully loads templates', () => {
   cy.visit('http://localhost:11222/console/', {
     headers: {
       "Accept-Encoding": "gzip, deflate, br"
     }
   });
   cy.get('button[aria-label="view-cache-configurations-button"]').click();
   cy.get('h1').should('contain', 'Cache templates');
   cy.contains('e2e-test-template');
 })
});


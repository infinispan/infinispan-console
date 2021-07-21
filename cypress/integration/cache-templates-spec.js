
describe('Cache Detail Overview', () => {
 it('successfully loads cache detail', () => {
   cy.visit('http://localhost:11222/console/container/default/configurations/', {
            headers: {
                    "Accept-Encoding": "gzip, deflate, br"
                     }
   });
   cy.get('h1').should('contain', 'Configuration templates');
   cy.contains('e2e-test-template');
 })

});


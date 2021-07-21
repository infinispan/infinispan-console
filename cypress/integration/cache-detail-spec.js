
describe('Cache Detail Overview', () => {
 it('successfully loads cache detail', () => {
   cy.visit('http://localhost:11222/console/cache/people', {
            headers: {
                    "Accept-Encoding": "gzip, deflate, br"
                     }
   });
   cy.get('h1').should('contain', 'people');
   cy.get('h4').should('contain', 'Transactional');
 })

});


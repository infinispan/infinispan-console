
describe('Cache Detail Overview', () => {
 it('successfully loads cache detail', () => {
   cy.visit('http://localhost:11222/console/cache/people', {
            headers: {
                    "Accept-Encoding": "gzip, deflate, br"
                     }
   });
   cy.contains('people');
   cy.contains('Transactional');
   cy.contains('Distributed');
   cy.contains('Rebalancing is on');
 })

});


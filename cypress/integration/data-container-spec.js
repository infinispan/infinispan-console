
describe('Data Container Overview', () => {

//Data Container Overview
 it('successfully loads Data Container Overview', () => {
   cy.visit('http://localhost:11222/console/', {
     headers: {
       "Accept-Encoding": "gzip, deflate, br"
     }
   });
   cy.contains('Server Management Console'); // header
   cy.contains('Default'); // cluster name
   cy.contains('Running'); // cluster status
   cy.contains('Cluster rebalancing on'); // rebalancing status
   cy.contains('default'); // cache default
   cy.contains('people'); // cache people
   cy.get('a[aria-label="nav-item-Caches"]').click();
   cy.get('a[aria-label="nav-item-Tasks"]').click();
   cy.get('a[aria-label="nav-item-Counters"]').click();
   cy.get('a[aria-label="nav-item-Schemas"]').click();
 })

});


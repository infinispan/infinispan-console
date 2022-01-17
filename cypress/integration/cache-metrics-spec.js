describe('Cache Metrics Overview', () => {
    it('successfully checks cache metrics', () => {
      cy.visit('http://localhost:11222/console/cache/people', {
               headers: {
                       "Accept-Encoding": "gzip, deflate, br"
                        }
      });
      
      //Check for Labels
      cy.contains('Metrics (Enabled)').click();;
      cy.contains('Current number of entries');
      cy.contains('Minimum number of nodes');
      cy.contains('Size of cache in off-heap memory');
      cy.contains('Size of cache in heap memory');

      // Check for data greater than -1
      cy.get('dt[aria-label="view-cache-metrics-size"]').invoke('text').then(parseFloat).should('be.gt', -1)
      cy.get('dt[aria-label="view-cache-metrics-nodes"]').invoke('text').then(parseFloat).should('be.gt', -1)
    })

    it('successfully checks cache metrics for heap memory', () => {
      cy.visit('http://localhost:11222/console/cache/heap-test', {
              headers: {
                "Accept-Encoding": "gzip, deflate, br"
                }
      });
      
      cy.contains('Metrics (Enabled)').click();
      cy.get('dt[aria-label="view-cache-metrics-heap"]').invoke('text').then(parseFloat).should('be.gt', -1)

    })

    it('successfully checks cache metrics for off-heap memory', () => {
      cy.visit('http://localhost:11222/console/cache/off-heap-test', {
              headers: {
                "Accept-Encoding": "gzip, deflate, br"
                }
      });
      
      cy.contains('Metrics (Enabled)').click();
      cy.get('dt[aria-label="view-cache-metrics-off-heap"]').invoke('text').then(parseFloat).should('be.gt', -1)
    })
   
});
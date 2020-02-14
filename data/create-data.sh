echo "= Init create data"
echo "= Clear all data"
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/users
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/people
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/example
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/local_users
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/invalidated
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/invalidated-sync
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/xsiteCache
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/caches/xsite-transactional
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/counters/weak1
curl -XDELETE  -u use:pass http://localhost:11222/rest/v2/counters/strong1

echo "= Create caches"
curl -XPOST  -u use:pass http://localhost:11222/rest/v2/caches/users?template=org.infinispan.DIST_ASYNC
curl -XPOST  -u use:pass http://localhost:11222/rest/v2/caches/people?template=org.infinispan.REPL_ASYNC
curl -XPOST  -u use:pass http://localhost:11222/rest/v2/caches/example?template=org.infinispan.DIST_SYNC
curl -XPOST  -u use:pass http://localhost:11222/rest/v2/caches/local_users?template=org.infinispan.LOCAL
curl -XPOST  -u use:pass http://localhost:11222/rest/v2/caches/invalidated?template=org.infinispan.INVALIDATION_ASYNC
curl -XPOST  -u use:pass http://localhost:11222/rest/v2/caches/invalidated-sync?template=org.infinispan.INVALIDATION_SYNC

curl -XPOST  -u use:pass -H "Content-Type: application/xml" -d "@xsiteCache.xml" http://localhost:11222/rest/v2/caches/xsiteCache
curl -XPOST  -u use:pass -H "Content-Type: application/xml" -d "@xsiteCache-transactional.xml" http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Put 1000 entries in people cache"
for i in {1..1000}
do
  URL="http://localhost:11222/rest/v2/caches/people/$i"
  DATA="data-$i"
  curl -XPOST  -u use:pass -d $DATA $URL
done

echo "= Create some counters"
for i in {1..50}
do
  curl -XPOST  -u use:pass -H "Content-Type: application/json" -d "@weakCounter.json" "http://localhost:11222/rest/v2/counters/weak-$i"
  curl -XPOST  -u use:pass -H "Content-Type: application/json" -d "@strongCounter.json" "http://localhost:11222/rest/v2/counters/strong-$i"
done

echo "= End"

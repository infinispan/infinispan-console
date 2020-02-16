echo "= Init create data"
echo "= Delete caches"
curl -XDELETE  http://localhost:11222/rest/v2/caches/users
curl -XDELETE  http://localhost:11222/rest/v2/caches/people
curl -XDELETE  http://localhost:11222/rest/v2/caches/example
curl -XDELETE  http://localhost:11222/rest/v2/caches/local_users
curl -XDELETE  http://localhost:11222/rest/v2/caches/invalidated
curl -XDELETE  http://localhost:11222/rest/v2/caches/invalidated-sync
curl -XDELETE  http://localhost:11222/rest/v2/caches/xsiteCache
curl -XDELETE  http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Create caches"
curl -XPOST  http://localhost:11222/rest/v2/caches/users?template=org.infinispan.DIST_ASYNC
curl -XPOST  http://localhost:11222/rest/v2/caches/people?template=org.infinispan.REPL_ASYNC
curl -XPOST  http://localhost:11222/rest/v2/caches/example?template=org.infinispan.DIST_SYNC
curl -XPOST  http://localhost:11222/rest/v2/caches/local_users?template=org.infinispan.LOCAL
curl -XPOST  http://localhost:11222/rest/v2/caches/invalidated?template=org.infinispan.INVALIDATION_ASYNC
curl -XPOST  http://localhost:11222/rest/v2/caches/invalidated-sync?template=org.infinispan.INVALIDATION_SYNC
curl -XPOST  -H "Content-Type: application/xml" -d "@xsiteCache.xml" http://localhost:11222/rest/v2/caches/xsiteCache
curl -XPOST  -H "Content-Type: application/xml" -d "@xsiteCache-transactional.xml" http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Put 100 entries in xsiteCache cache"
for i in {1..100}
do
  URL="http://localhost:11222/rest/v2/caches/xsiteCache/$i"
  DATA="data-$i"
  curl -XPOST -d $DATA $URL
done

echo "= Put 20 entries in xsite-transactional cache"
for i in {1..20}
do
  URL="http://localhost:11222/rest/v2/caches/xsite-transactional/$i"
  DATA="data-$i"
  curl -XPOST -d $DATA $URL
done

echo "= Delete counters"
for i in {1..5}
do
curl -XDELETE http://localhost:11222/rest/v2/counters/weak-$i
curl -XDELETE http://localhost:11222/rest/v2/counters/strong-$i
done

echo "= Create some counters"
for i in {1..5}
do
  curl -XPOST -H "Content-Type: application/json" -d "@weakCounter.json" "http://localhost:11222/rest/v2/counters/weak-$i"
  curl -XPOST -H "Content-Type: application/json" -d "@strongCounter.json" "http://localhost:11222/rest/v2/counters/strong-$i"
done

echo "= Create some tasks"
curl -XPOST -H "Content-Type: application/javascript" -d "@hello.js" "http://localhost:11222/rest/v2/tasks/hello"

echo "= End"

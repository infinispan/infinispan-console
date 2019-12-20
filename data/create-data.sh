echo "= Init create data"
echo "= Clear all data"
curl -XDELETE http://localhost:11222/rest/v2/caches/users
curl -XDELETE http://localhost:11222/rest/v2/caches/people
curl -XDELETE http://localhost:11222/rest/v2/caches/example
curl -XDELETE http://localhost:11222/rest/v2/caches/local_users
curl -XDELETE http://localhost:11222/rest/v2/caches/invalidated
curl -XDELETE http://localhost:11222/rest/v2/caches/invalidated-sync
curl -XDELETE http://localhost:11222/rest/v2/caches/xsiteCache
curl -XDELETE http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Create caches"
curl -XPOST http://localhost:11222/rest/v2/caches/users?template=org.infinispan.DIST_ASYNC
curl -XPOST http://localhost:11222/rest/v2/caches/people?template=org.infinispan.REPL_ASYNC
curl -XPOST http://localhost:11222/rest/v2/caches/example?template=org.infinispan.DIST_SYNC
curl -XPOST http://localhost:11222/rest/v2/caches/local_users?template=org.infinispan.LOCAL
curl -XPOST http://localhost:11222/rest/v2/caches/invalidated?template=org.infinispan.INVALIDATION_ASYNC
curl -XPOST http://localhost:11222/rest/v2/caches/invalidated-sync?template=org.infinispan.INVALIDATION_SYNC

curl -XPOST -H "Content-Type: application/xml" -d "@xsiteCache.xml" http://localhost:11222/rest/v2/caches/xsiteCache
curl -XPOST -H "Content-Type: application/xml" -d "@xsiteCache-transactional.xml" http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Put 1000 entries in people cache"
for i in {1..1000}
do
  URL="http://localhost:11222/rest/v2/caches/people/$i"
  DATA="data-$i"
  curl -XPOST -d $DATA $URL
done
echo "= End"

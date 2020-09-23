user=$1
pass=$2
userPass="$user:$pass"
echo "= Init create data"
echo "= Delete caches"
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/users
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/managers
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/programmers
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/seniors
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/people
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/example
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/local_users
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/invalidated
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/invalidated-sync
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/xsiteCache
#curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Create caches"
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/users2?template=org.infinispan.DIST_ASYNC
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/users?template=org.infinispan.DIST_ASYNC
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/managers?template=org.infinispan.REPL_SYNC
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/programmers?template=org.infinispan.LOCAL
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/seniors?template=org.infinispan.LOCAL
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/people?template=org.infinispan.REPL_ASYNC
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/example?template=org.infinispan.DIST_SYNC
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/local_users?template=org.infinispan.LOCAL
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/invalidated?template=org.infinispan.INVALIDATION_ASYNC
curl -XPOST  -u $userPass http://localhost:11222/rest/v2/caches/invalidated-sync?template=org.infinispan.INVALIDATION_SYNC
#curl -XPOST  -u $userPass -H "Content-Type: application/xml" -d "@xsiteCache.xml" http://localhost:11222/rest/v2/caches/xsiteCache
#curl -XPOST  -u $userPass -H "Content-Type: application/xml" -d "@xsiteCache-transactional.xml" http://localhost:11222/rest/v2/caches/xsite-transactional

#echo "= Put 100 entries in xsiteCache cache"
#for i in {1..100}
#do
#  URL="http://localhost:11222/rest/v2/caches/xsiteCache/$i"
#  DATA="data-$i"
#  curl -XPOST -u $userPass -d $DATA $URL
#done
#
#echo "= Put 20 entries in xsite-transactional cache"
#for i in {1..20}
#do
#  URL="http://localhost:11222/rest/v2/caches/xsite-transactional/$i"
#  DATA="data-$i"
#  curl -XPOST -u $userPass -d $DATA $URL
#done

echo "= Delete counters"
for i in {1..5}
do
curl -XDELETE -u $userPass http://localhost:11222/rest/v2/counters/weak-$i
curl -XDELETE -u $userPass http://localhost:11222/rest/v2/counters/strong-$i
done

echo "= Create some counters"
for i in {1..5}
do
  curl -XPOST -u $userPass -H "Content-Type: application/json" -d "@weakCounter.json" "http://localhost:11222/rest/v2/counters/weak-$i"
  curl -XPOST -u $userPass -H "Content-Type: application/json" -d "@strongCounter.json" "http://localhost:11222/rest/v2/counters/strong-$i"
done

echo "= Create some tasks"
curl -XPOST -u $userPass -H "Content-Type: application/javascript" -d "@hello.js" "http://localhost:11222/rest/v2/tasks/hello"

echo "= End"

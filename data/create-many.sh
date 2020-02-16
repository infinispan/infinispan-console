echo "= Init create many data"
echo "= Delete caches"
for i in {1..500}
do
curl -XDELETE  http://localhost:11222/rest/v2/caches/users-$i
done

echo "= Create caches"
for i in {1..500}
do
curl -XPOST  http://localhost:11222/rest/v2/caches/users-$i?template=org.infinispan.DIST_ASYNC
done

echo "= Delete counters"
for i in {1..500}
do
curl -XDELETE http://localhost:11222/rest/v2/counters/weak-$i
curl -XDELETE http://localhost:11222/rest/v2/counters/strong-$i
done

echo "= Create some counters"
for i in {1..500}
do
  curl -XPOST -H "Content-Type: application/json" -d "@weakCounter.json" "http://localhost:11222/rest/v2/counters/weak-$i"
  curl -XPOST -H "Content-Type: application/json" -d "@strongCounter.json" "http://localhost:11222/rest/v2/counters/strong-$i"
done

echo "= Create some tasks"
for i in {1..1000}
do
 curl -XPOST -H "Content-Type: application/javascript" -d "@hello.js" "http://localhost:11222/rest/v2/tasks/hello$i"
done

echo "= End"

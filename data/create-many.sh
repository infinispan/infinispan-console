user=$1
pass=$2
userPass="$user:$pass"

echo "= Init create many data"
echo "= Delete caches"
for i in {1..500}
do
curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/users-$i
done

echo "= Create caches"
for i in {1..500}
do
curl -XPOST -u $userPass http://localhost:11222/rest/v2/caches/users-$i?template=org.infinispan.DIST_ASYNC
done

echo "= Delete counters"
for i in {1..500}
do
curl -XDELETE -u $userPass http://localhost:11222/rest/v2/counters/weak-$i
curl -XDELETE -u $userPass http://localhost:11222/rest/v2/counters/strong-$i
done

echo "= Create some counters"
for i in {1..500}
do
  curl -XPOST -u $userPass -H "Content-Type: application/json" -d "@weakCounter.json" "http://localhost:11222/rest/v2/counters/weak-$i"
  curl -XPOST -u $userPass  -H "Content-Type: application/json" -d "@strongCounter.json" "http://localhost:11222/rest/v2/counters/strong-$i"
done

echo "= Create some tasks"
for i in {1..1000}
do
 curl -XPOST -u $userPass -H "Content-Type: application/javascript" -d "@hello.js" "http://localhost:11222/rest/v2/tasks/hello$i"
done

echo "= End"

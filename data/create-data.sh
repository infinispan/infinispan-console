user=$1
pass=$2
userPass="$user:$pass"
echo "= Init create data"
echo "= Delete caches"
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/schemas/people
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/protobuf-cache
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/json-cache
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/xml-cache
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/java-cache
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/jboss-cache
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/text-cache
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/not-encoded
curl -XDELETE  --digest -u $userPass http://localhost:11222/rest/v2/caches/indexed-cache

echo "= Create schema"

curl -XPOST --digest -u $userPass -H "Content-Type: application/json" --data-binary "@schemas/people.proto" "http://localhost:11222/rest/v2/schemas/people"

echo "= Create caches"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/protobufCache.json" "http://localhost:11222/rest/v2/caches/protobuf-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/textCache.json" "http://localhost:11222/rest/v2/caches/text-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/xmlCache.json" "http://localhost:11222/rest/v2/caches/xml-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/jsonCache.json" "http://localhost:11222/rest/v2/caches/json-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/jbossCache.json" "http://localhost:11222/rest/v2/caches/jboss-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/javaCache.json" "http://localhost:11222/rest/v2/caches/java-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/notEncoded.json" "http://localhost:11222/rest/v2/caches/not-encoded"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/indexedCache.json" "http://localhost:11222/rest/v2/caches/indexed-cache"


for i in {1..10}
do
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.String" -H "Content-Type: application/x-java-object;type=java.lang.String" -d "val-$i" http://localhost:11222/rest/v2/caches/protobuf-cache/key-$i
done

echo "= Delete counters"
for i in {1..5}
do
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/counters/weak-$i
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/counters/strong-$i
done

echo "= Create some counters"
for i in {1..5}
do
  curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@counters/weakCounter.json" "http://localhost:11222/rest/v2/counters/weak-$i"
  curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@counters/strongCounter.json" "http://localhost:11222/rest/v2/counters/strong-$i"
done

echo "= Create some tasks"
curl -XPOST --digest -u $userPass -H "Content-Type: application/javascript" -d "@tasks/hello.js" "http://localhost:11222/rest/v2/tasks/hello"

echo "= End"

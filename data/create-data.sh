user=$1
pass=$2
userPass="$user:$pass"
echo "= Init create data"
echo "= Delete caches"
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/schemas/people
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/json-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/xml-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/java-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/jboss-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/text-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/not-encoded
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/indexed-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/octet-stream-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/java-serialized-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/invalidation-cache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/xsiteCache
curl -XDELETE --digest -u $userPass http://localhost:31222/rest/v2/caches/xsiteCache
curl -XDELETE --digest -u $userPass http://localhost:11222/rest/v2/caches/xsite-cache
curl -XDELETE --digest -u $userPass http://localhost:31222/rest/v2/caches/xsite-backup

echo "= Create schema"

curl -XPOST --digest -u $userPass -H "Content-Type: application/json" --data-binary "@schemas/people.proto" "http://localhost:11222/rest/v2/schemas/people"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" --data-binary "@schemas/child.proto" "http://localhost:11222/rest/v2/schemas/child"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" --data-binary "@schemas/car.proto" "http://localhost:11222/rest/v2/schemas/car"

#Creating some more schemas for testing pagination and navigation
for i in {1..10}
do
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" --data-binary "testSchema-$i" "http://localhost:11222/rest/v2/schemas/test-$i"
done

echo "= Create caches"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/textCache.json" "http://localhost:11222/rest/v2/caches/text-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/xmlCache.json" "http://localhost:11222/rest/v2/caches/xml-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/jsonCache.json" "http://localhost:11222/rest/v2/caches/json-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/jbossCache.json" "http://localhost:11222/rest/v2/caches/jboss-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/javaCache.json" "http://localhost:11222/rest/v2/caches/java-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/notEncoded.json" "http://localhost:11222/rest/v2/caches/not-encoded"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/indexedCache.json" "http://localhost:11222/rest/v2/caches/indexed-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/indexedCacheNonAuth.json" "http://localhost:11222/rest/v2/caches/indexed-cache-no-auth"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/octet-stream.json" "http://localhost:11222/rest/v2/caches/octet-stream-cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/javaSerializedCache.json" "http://localhost:11222/rest/v2/caches/java-serialized-cache"
echo "= Create X-Site Cache"
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/xsiteLON.json" http://localhost:11222/rest/v2/caches/xsiteCache
curl -XPOST --digest -u $userPass -H "Content-Type: application/json" -d "@caches/xsiteNYC.json" http://localhost:31222/rest/v2/caches/xsiteCache


for i in {1..10}
do
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.String" -H "Content-Type: application/x-java-object;type=java.lang.String" -d "val-$i" http://localhost:11222/rest/v2/caches/indexed-cache/key-$i
done
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.String" -H "Content-Type: application/json" -d "@caches/peopleData.json" http://localhost:11222/rest/v2/caches/indexed-cache/elaia
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.String" -H "Content-Type: application/json" -d "@caches/childData.json" http://localhost:11222/rest/v2/caches/indexed-cache-no-auth/elaia

#Java data
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.String" -H "Content-Type: application/x-java-object;type=java.lang.String" -d string http://localhost:11222/rest/v2/caches/java-cache/key
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.Long" -H "Content-Type: application/x-java-object;type=java.lang.String" -d long http://localhost:11222/rest/v2/caches/java-cache/12345678
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.Integer" -H "Content-Type: application/x-java-object;type=java.lang.String" -d integer http://localhost:11222/rest/v2/caches/java-cache/123
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.Double" -H "Content-Type: application/x-java-object;type=java.lang.String" -d double http://localhost:11222/rest/v2/caches/java-cache/123.909
curl -XPOST --digest -u $userPass -H "Key-Content-Type: application/x-java-object;type=java.lang.Float" -H "Content-Type: application/x-java-object;type=java.lang.String" -d float http://localhost:11222/rest/v2/caches/java-cache/12.87

#XSite data
echo "= Put 5 entries in XSite cache"
for i in {1..5}
do
  URL='http://localhost:11222/rest/v2/caches/xsiteCache/key'$i
  DATA='{
             "_type": "string",
             "_value": "value'$i'"
          }'
  curl -XPOST --digest -u $userPass -d "$DATA" -H 'Content-Type: application/json' $URL
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
curl -XPOST  -u $userPass -H "Content-Type: application/javascript" -d "@tasks/hello.js" "http://localhost:11222/rest/v2/tasks/hello"

echo "= End"

echo "= Init create data"
echo "= Clear all data"
curl -XDELETE --BASIC -u admin:password http://localhost:11222/rest/v2/caches/xsiteCache
curl -XDELETE --BASIC -u admin:password http://localhost:31222/rest/v2/caches/xsiteCache

echo "= Create X-Site Cache"
curl -XPOST --BASIC -u admin:password -H "Content-Type: application/xml" -d "@ispn-lon.xml" http://localhost:11222/rest/v2/caches/xsiteCache
curl -XPOST --BASIC -u admin:password -H "Content-Type: application/xml" -d "@ispn-nyc.xml" http://localhost:31222/rest/v2/caches/xsiteCache

echo "= Put 5 entries in XSite cache"
for i in {1..5}
do
  URL='http://localhost:11222/rest/v2/caches/xsiteCache/key'$i
  DATA='{
             "_type": "string",
             "_value": "value'$i'"
          }'
  curl -XPOST --BASIC -u admin:password -d "$DATA" -H 'Content-Type: application/json' $URL
done

echo "= End"
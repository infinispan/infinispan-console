# Run the server in xsite  mode using docker-compose-up script
user=$1
pass=$2
userPass="$user:$pass"
echo "= Init create xsite data"
echo "= Delete caches"
curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/xsiteCache
curl -XDELETE  -u $userPass http://localhost:11222/rest/v2/caches/xsite-transactional

echo "= Create caches"

curl -XPOST  -u $userPass -H "Content-Type: application/xml" -d "@xsiteCache.xml" http://localhost:11222/rest/v2/caches/xsiteCache
curl -XPOST  -u $userPass -H "Content-Type: application/xml" -d "@xsiteCache-transactional.xml" http://localhost:11222/rest/v2/caches/xsite-transactional

kubectl create -f identities_xsitea.yaml
kubectl create -f identities_xsiteb.yaml

kubectl apply -f xsite_a.yaml
kubectl apply -f xsite_b.yaml

# TODO wait the cluster to form
sleep 120

kubectl apply -f cache_xsite_a.yaml
kubectl apply -f cache_xsite_b.yaml
# Minikube

## Install
```bash
minikube start --driver=virtualbox --cpus 4 --memory "8192mb"
```

## Create the XSite
```bash
./setup.sh
```

## Do you need access the service from your machine?
```bash
minikube service example-clustera-external
```
```bash
minikube service example-clusterb-external
```

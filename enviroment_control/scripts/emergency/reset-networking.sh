#!/bin/bash

echo "Starting network recovery procedure..."

# Reset CNI
echo "Resetting CNI..."
kubectl delete -f /etc/cni/net.d/
rm -rf /etc/cni/net.d/*
systemctl restart kubelet

# Reset Istio networking
echo "Resetting Istio..."
kubectl delete -n istio-system $(kubectl get pods -n istio-system -o name | grep "istio-proxy")
kubectl delete -n rabere-habitat $(kubectl get pods -n rabere-habitat -o name | grep "istio-proxy")

# Reset CoreDNS
echo "Resetting CoreDNS..."
kubectl -n kube-system rollout restart deployment coredns

# Reset node networking
echo "Resetting node networking..."
systemctl restart docker
ip link set docker0 down
ip link delete docker0
systemctl restart containerd

# Reapply CNI configuration
echo "Reapplying CNI configuration..."
kubectl apply -f kubernetes/network/cilium.yaml

# Wait for network components to be ready
echo "Waiting for network components..."
kubectl wait --for=condition=ready pod -l k8s-app=cilium -n kube-system --timeout=300s
kubectl wait --for=condition=ready pod -l k8s-app=coredns -n kube-system --timeout=300s

echo "Network reset completed. Verifying connectivity..."

# Verify connectivity
kubectl get nodes -o wide
kubectl get pods --all-namespaces 
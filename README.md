# Rabere Detection and Monitoring System (RDMS)

## System Overview

This project represents a comprehensive solution for early detection and monitoring of rabere in animals, combining video analysis, behavioral monitoring, and centralized management.

## Core Components

### 1. Video Analysis System
Advanced computer vision system providing:
- Real-time behavior monitoring
- Aggression detection
- Movement pattern analysis
- Hydrophobia detection
- Activity level tracking

### 2. Neural Detection System
Sophisticated deep learning solution for:
- Real-time animal tracking
- Behavior classification
- Symptom detection
- Continuous monitoring
- Early warning system

### 3. Main Server (RDMS)
State-of-the-art distributed system architecture for:
- Real-time video processing
- Behavioral analysis
- Machine learning analytics
- Alert management
- Veterinary notification system

## Technical Architecture

### Hardware Requirements

#### Production Environment
- **CPU**: 32+ cores (Intel Xeon Gold 6348 or AMD EPYC 7543)
- **RAM**: 128GB ECC DDR4-3200
- **Storage**: 
  - System: 2x 1TB NVMe SSD (RAID 1)
  - Data: 4x 2TB NVMe SSD (RAID 10)
  - Backup: 10TB usable storage
- **GPU**: NVIDIA A100 80GB PCIe
- **Network**: 2x 10GbE NICs

#### Development Environment
- **CPU**: 16 cores
- **RAM**: 64GB RAM
- **Storage**: 1TB NVMe SSD
- **GPU**: NVIDIA RTX 3080 (10GB)

### Software Stack

#### Core Infrastructure
- **Container Runtime**: Docker 24.0+
- **Orchestration**: Kubernetes 1.28+
- **Service Mesh**: Istio 1.18
- **Service Discovery**: Consul 1.15

#### Data Processing
- **Stream Processing**: 
  - Apache Kafka 3.5
  - Apache Flink 1.17
  - Apache Spark 3.4
- **Time Series**: 
  - InfluxDB 2.7
  - Prometheus 2.44
  - OpenTSDB

#### Storage
- **Operational Data**:
  - PostgreSQL 15
  - MongoDB 6.0
  - Cassandra 4.1
- **Cache Layer**:
  - Redis 7.0 Cluster
  - Memcached 1.6

## Component Details

### 1. Environment Control System

#### Core Features
- PID (Proportional-Integral-Derivative) control loops
- Automatic day/night cycle management
- Emergency safety protocols
- Sensor calibration capabilities
- EEPROM-based configuration storage

#### Network Connectivity
- WiFi-enabled communication
- NTP time synchronization
- Real-time data streaming
- Remote command interface
- Fallback safety modes

### 2. Neural Spider Detection

#### Neural Network Architecture
- ResNet50 backbone pre-trained on ImageNet
- Feature pyramid network for multi-scale detection
- Custom detection head with multiple convolution layers
- Temporal feature extraction using Bi-directional LSTM
- Multi-head self-attention mechanism

#### Performance Metrics
- Mean Average Precision (mAP)
- Intersection over Union (IoU)
- False Positive/Negative Rates
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)

### 3. Main Server Architecture

#### Microservices Ecosystem
- API Gateway Service (NestJS)
- Device Control Service (Go)
- Stream Management Service (Node.js)
- Telemetry Processing Service (Rust)
- ML Analytics Service (Python)
- Environmental Control Service (Elixir)

#### Security Implementation
- mTLS Communication
- Zero-trust architecture
- AES-256 encryption at rest
- TLS 1.3 in transit
- RBAC implementation

## Installation and Deployment

### Environment Control System Installation

#### Hardware Assembly
1. Required Tools
   - Soldering Iron (30-40W) with solder
   - Wire strippers
   - Heat shrink tubing
   - Multimeter
   - Small Phillips screwdriver
   - Hot glue gun
   - Wire cutters

2. Components
   - ESP8266 NodeMCU Board
   - DHT22 Temperature/Humidity Sensor
   - HC-SR501 PIR Motion Sensor
   - 4x MOSFET IRF520N Modules
   - 12V to 5V Buck Converter
   - 12V 2A Power Supply
   - Breadboard or PCB
   - Jumper wires
   - 10kΩ resistor

3. Assembly Steps
   - Prepare enclosure with necessary holes
   - Install cable glands and mount components
   - Connect power supply and buck converter
   - Wire sensors and actuators
   - Verify all connections with multimeter

#### Wiring Diagram
```
Power Distribution:
12V PSU ----+-----> Buck Converter -> 5V -> NodeMCU
            |
            +-----> Heating Element (via MOSFET)
            |
            +-----> Humidifier (via MOSFET)
            |
            +-----> Fan (via MOSFET)
            |
            +-----> LED Strip (via MOSFET)

Signal Connections:
NodeMCU:
  3.3V ----+-----> DHT22 VCC
           |
           +-----> PIR VCC
  
  GND -----+-----> DHT22 GND
           |
           +-----> PIR GND
           |
           +-----> All MOSFET GND
  
  D2 ------+-----> DHT22 DATA
  D4 ------+-----> Heater MOSFET SIG
  D5 ------+-----> Humidifier MOSFET SIG
  D12 -----+-----> Fan MOSFET SIG
  D13 -----+-----> LED MOSFET SIG
  D14 -----+-----> PIR DATA
```

#### Software Setup
1. Install Arduino IDE
2. Add ESP8266 board support
3. Install required libraries:
   - DHT Sensor Library
   - ArduinoJson
   - ESP8266WiFi
   - ESP8266HTTPClient
   - NTPClient
   - PID Library
4. Upload firmware
5. Configure network settings
6. Calibrate sensors

#### System Configuration

1. Kernel Parameters
```bash
# /etc/sysctl.conf
fs.file-max=2097152
fs.nr_open=2097152
net.core.somaxconn=32768
net.ipv4.tcp_max_syn_backlog=16384
net.core.netdev_max_backlog=16384
net.ipv4.tcp_timestamps=1
net.ipv4.tcp_sack=1
net.ipv4.tcp_window_scaling=1
net.ipv4.tcp_rmem=4096 87380 16777216
net.ipv4.tcp_wmem=4096 65536 16777216
net.core.rmem_max=16777216
net.core.wmem_max=16777216
vm.max_map_count=262144
vm.swappiness=10
kernel.shmmax=68719476736
kernel.shmall=4294967296
```

2. Security Limits
```bash
# /etc/security/limits.conf
* soft nofile 1048576
* hard nofile 1048576
* soft nproc 262144
* hard nproc 262144
* soft memlock unlimited
* hard memlock unlimited
```

### Neural Spider Detection Installation

#### Environment Setup
1. Create Python Environment:
```bash
conda create -n spider_detect python=3.8
conda activate spider_detect
```

2. Install Dependencies:
```bash
pip install torch torchvision
pip install opencv-python
pip install numpy pandas
pip install albumentations
pip install tensorboard
```

#### Model Setup
1. Download pre-trained weights
2. Configure model parameters:
   - Input resolution: 640x640
   - Batch size: 16
   - Learning rate: 0.001
   - Weight decay: 0.0005

3. Data Pipeline Setup:
   - Prepare training data directory
   - Configure data augmentation
   - Set up validation split
   - Initialize data loaders

4. Training Configuration:
   - Set up logging
   - Configure checkpointing
   - Initialize optimizer
   - Set up learning rate scheduler

#### Model Architecture Details
1. Feature Extraction
   ```
   Input Image (640x640x3)
   │
   ├── ResNet50 Backbone
   │   ├── Conv1-5 blocks
   │   └── Feature maps (2048 channels)
   │
   ├── Detection Branch
   │   ├── Conv (2048->512)
   │   ├── Conv (512->256)
   │   └── Conv (256->5)
   │
   └── Activity Branch
       ├── Temporal LSTM
       ├── Self-Attention
       └── Activity Regression
   ```

2. Loss Functions
   - Bounding Box: Smooth L1 Loss
   - Objectness: Binary Cross Entropy
   - Activity: Mean Squared Error
   - Combined loss with adaptive weighting

### Main Server (AHECS) Installation

#### Infrastructure Setup

1. Base System Requirements
```bash
# Install system packages
apt-get update && apt-get install -y \
  build-essential \
  cmake \
  pkg-config \
  libssl-dev \
  libpq-dev \
  libbz2-dev \
  libreadline-dev \
  libsqlite3-dev \
  libffi-dev \
  zlib1g-dev
```

2. Container Runtime Setup
```bash
# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io
```

3. Kubernetes Setup
```bash
# Install Kubernetes components
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/kubernetes-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
apt-get update && apt-get install -y kubelet=1.28.0-00 kubeadm=1.28.0-00 kubectl=1.28.0-00

# Initialize control plane
kubeadm init --config=kubernetes/config/kubeadm-config.yaml \
             --upload-certs \
             --skip-phases=addon/kube-proxy

# Configure kubectl
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# Install CNI plugin
kubectl apply -f kubernetes/network/cilium.yaml
```

#### Service Mesh Setup

1. Istio Installation
```bash
# Download Istio
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.18.0 sh -

# Install Istio operator
istioctl operator init --watchedNamespaces=istio-system,spider-habitat

# Apply Istio configuration
kubectl apply -f kubernetes/istio/operator.yaml

# Enable sidecar injection
kubectl label namespace spider-habitat istio-injection=enabled
```

2. Consul Setup
```bash
# Install Consul
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update

helm install consul hashicorp/consul \
  --version 1.15.0 \
  --namespace consul \
  --create-namespace \
  -f kubernetes/consul/values.yaml

# Configure Consul Connect
kubectl apply -f kubernetes/consul/connect-inject.yaml
```

#### Database Setup

1. PostgreSQL Installation
```bash
# Create storage class
kubectl apply -f storage/postgresql-sc.yaml

# Deploy PostgreSQL operator
kubectl apply -f operators/postgresql-operator.yaml

# Create PostgreSQL cluster
kubectl apply -f postgresql/cluster.yaml

# Initialize databases
PGPASSWORD=$PG_PASSWORD psql -h $PG_HOST -U postgres -f database/init/schema.sql
```

2. MongoDB Setup
```bash
# Deploy MongoDB operator
kubectl apply -f operators/mongodb-operator.yaml

# Create config servers and shards
kubectl apply -f mongodb/configserver.yaml
kubectl apply -f mongodb/shard1.yaml
kubectl apply -f mongodb/shard2.yaml

# Initialize sharding
kubectl exec -it mongodb-mongos-0 -- mongosh --eval 'sh.enableSharding("spider_habitat")'
```

3. Cassandra Setup
```bash
# Deploy Cassandra operator
kubectl apply -f operators/cassandra-operator.yaml

# Create Cassandra datacenter
kubectl apply -f cassandra/datacenter.yaml

# Initialize keyspaces
kubectl exec -it cassandra-0 -- cqlsh -f database/cassandra/init.cql
```

#### Message Queue Setup

1. Kafka Cluster
```bash
# Install Strimzi operator
kubectl apply -f kubernetes/operators/strimzi-cluster-operator.yaml

# Deploy Kafka cluster
kubectl apply -f kubernetes/kafka/kafka-cluster.yaml

# Create topics
kubectl apply -f kubernetes/kafka/topics/
```

2. RabbitMQ Cluster
```bash
# Install RabbitMQ operator
kubectl apply -f kubernetes/operators/rabbitmq-operator.yaml

# Deploy RabbitMQ cluster
kubectl apply -f kubernetes/rabbitmq/cluster.yaml

# Configure vhosts and permissions
kubectl exec -it rabbitmq-0 -- rabbitmqctl add_vhost spider_habitat
kubectl exec -it rabbitmq-0 -- rabbitmqctl set_permissions -p spider_habitat YOUR_USER ".*" ".*" ".*"
```

#### Service Deployment

1. Build Services
```bash
# Build API Gateway
docker build -t ahecs/api-gateway:latest -f services/api-gateway/Dockerfile services/api-gateway

# Build Device Control Service
docker build -t ahecs/device-control:latest -f services/device-control/Dockerfile services/device-control

# Build ML Analytics Service
docker build -t ahecs/ml-analytics:latest -f services/ml-analytics/Dockerfile services/ml-analytics
```

2. Deploy Services
```bash
# Create namespaces
kubectl apply -f namespaces/

# Apply ConfigMaps and Secrets
kubectl apply -f config/
kubectl apply -f secrets/

# Deploy core services
kubectl apply -k base/
```

#### Monitoring Setup

1. Prometheus Stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -f monitoring/prometheus-values.yaml
```

2. ELK Stack
```bash
helm repo add elastic https://helm.elastic.co
helm repo update
helm install elasticsearch elastic/elasticsearch -f logging/elasticsearch-values.yaml
helm install kibana elastic/kibana -f logging/kibana-values.yaml
helm install filebeat elastic/filebeat -f logging/filebeat-values.yaml
```

## Maintenance

### Regular Tasks
1. Daily
   - Check water level
   - Verify sensor readings
   - Monitor error logs
   - Check system metrics
   - Review alert logs

2. Weekly
   - Clean sensors
   - Check fan operation
   - Verify PID performance
   - Database backup
   - Log rotation

3. Monthly
   - Calibrate sensors
   - Update firmware
   - Deep clean system
   - Model retraining
   - Performance evaluation
   - Dataset updates
   - Security audit
   - Certificate rotation

### Monitoring
- Resource usage tracking
- Inference latency monitoring
- Error logging and alerts
- GPU utilization
- Memory usage
- System metrics
- Application metrics
- Network performance
- Database health
- Queue depths
- Service mesh metrics

### Backup Procedures
```bash
# Database backups
./scripts/backup/postgresql-backup.sh
./scripts/backup/mongodb-backup.sh
./scripts/backup/cassandra-backup.sh

# Configuration backups
./scripts/backup/etcd-backup.sh
./scripts/backup/consul-backup.sh
```

### Emergency Procedures
```bash
# Service recovery
kubectl rollout undo deployment/SERVICE_NAME

# Database failover
./scripts/emergency/postgresql-failover.sh
./scripts/emergency/mongodb-failover.sh

# Network recovery
./scripts/emergency/reset-networking.sh
```

## License

Proprietary. All rights reserved.

© 2025 RabereAI Team 
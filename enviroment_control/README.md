# Spider Environment Control System - Advanced Edition

## System Overview
This advanced environmental control system provides comprehensive monitoring and management of a spider habitat. The system incorporates multiple sensors, actuators, and sophisticated control algorithms to maintain optimal living conditions.

## Core Features

### Environmental Monitoring
- Real-time temperature monitoring (±0.5°C accuracy)
- Humidity monitoring (±2-5% accuracy)
- Heat index calculation
- Motion detection for spider activity
- Light level control
- Ventilation management

### Intelligent Control
- PID (Proportional-Integral-Derivative) control loops
- Automatic day/night cycle management
- Emergency safety protocols
- Sensor calibration capabilities
- EEPROM-based configuration storage

### Network Connectivity
- WiFi-enabled communication
- NTP time synchronization
- Real-time data streaming
- Remote command interface
- Fallback safety modes

## Hardware Architecture

### Required Components
1. Main Controller
   - ESP8266 WiFi-enabled microcontroller
   - Operating voltage: 3.3V
   - Flash memory: ≥4MB recommended

2. Sensors
   - DHT22 Temperature/Humidity Sensor
     - Temperature range: -40°C to 80°C
     - Humidity range: 0-100% RH
   - PIR Motion Sensor
     - Detection range: 5-7 meters
     - Detection angle: 120°

3. Actuators
   - Heating Element (PWM controlled)
     - Voltage: 5-12V DC
     - Power: 10-30W recommended
   - Humidifier Module (PWM controlled)
     - Ultrasonic atomization
     - Water capacity: ≥300ml
   - Ventilation Fan
     - 12V DC
     - Airflow: 50-100 CFM
   - LED Lighting System
     - Day/night simulation
     - Color temperature: 4000-6500K

4. Power Supply
   - Main input: 12V DC
   - Current capacity: 2A minimum
   - Voltage regulators for 5V and 3.3V

### Pin Configuration
```
GPIO Mapping:
D2  (GPIO4)  - DHT22 Data
D4  (GPIO2)  - Heating Element (PWM)
D5  (GPIO14) - Humidifier Control (PWM)
D12 (GPIO12) - Fan Control
D13 (GPIO13) - Light Control
D14 (GPIO14) - Motion Sensor Input
```

## Software Architecture

### Core Systems

1. Sensor Management
   - Automated sensor polling
   - Error detection and handling
   - Rolling average calculations
   - Sensor calibration system

2. Control Systems
   - PID Controllers
     - Independent temperature loop
     - Independent humidity loop
     - Auto-tuning capabilities
   - Safety bounds checking
   - Emergency shutdown protocols

3. Configuration Management
   - EEPROM-based storage
   - Runtime configuration updates
   - Default value failsafes
   - Configuration validation

4. Network Stack
   - WiFi connection management
   - NTP time synchronization
   - HTTP client implementation
   - JSON data formatting

### Operating Modes

1. Normal Operation
   - PID-controlled environment
   - Automatic day/night cycling
   - Motion monitoring
   - Data logging

2. Night Mode
   - Reduced temperature setpoint
   - Disabled lighting
   - Reduced fan operation
   - Continued monitoring

3. Emergency Mode
   - Activated by:
     - Sensor failures
     - Network disconnection
     - Environmental extremes
   - Actions:
     - Disable heating
     - Enable ventilation
     - Alert notification
     - Fallback to safe defaults

## Communication Protocol

### Telemetry Data Format
```json
{
  "temperature": float,      // Current temperature (°C)
  "humidity": float,        // Current humidity (%)
  "heatIndex": float,      // Calculated heat index
  "motionDetected": bool,  // Motion sensor state
  "isHeating": bool,       // Heater state
  "isHumidifying": bool,   // Humidifier state
  "isFanOn": bool,         // Fan state
  "isLightOn": bool,       // Light state
  "timestamp": long,       // Unix timestamp
  "timeString": string,    // Formatted time
  "tempSetpoint": float,   // Target temperature
  "humSetpoint": float,    // Target humidity
  "pidOutput": float,      // PID control output
  "emergencyMode": bool    // Emergency state
}
```

### Control Commands
```json
{
  "setTemperature": float,  // Set target temperature
  "setHumidity": float,    // Set target humidity
  "autoMode": bool,        // Enable/disable automatic control
  "nightMode": bool,       // Enable/disable night mode
  "calibrate": {
    "tempOffset": float,   // Temperature calibration
    "humOffset": float     // Humidity calibration
  },
  "resetEmergency": bool   // Reset emergency mode
}
```

## Safety Systems

### Environmental Limits
- Temperature: 20-30°C
- Humidity: 65-75%
- Heat Index: <35°C

### Failsafe Mechanisms
1. Sensor Failure Detection
   - Consecutive read failures tracking
   - Automatic emergency mode activation
   - Sensor reset attempts

2. Network Failure Handling
   - Offline operation capability
   - Local control maintenance
   - Automatic reconnection

3. Hardware Protection
   - PWM duty cycle limits
   - Minimum cycle times
   - Thermal protection

4. Data Validation
   - Sensor reading validation
   - Command input validation
   - Configuration bounds checking

## Maintenance

### Regular Tasks
1. Daily
   - Check water level
   - Verify sensor readings
   - Monitor error logs

2. Weekly
   - Clean sensors
   - Check fan operation
   - Verify PID performance

3. Monthly
   - Calibrate sensors
   - Update firmware
   - Deep clean system

### Troubleshooting Guide

1. Sensor Issues
   - Check power connections
   - Verify pin configurations
   - Clean sensor surfaces
   - Check for interference

2. Control Problems
   - Verify PID parameters
   - Check actuator function
   - Validate sensor readings
   - Review safety limits

3. Network Issues
   - Check WiFi signal
   - Verify credentials
   - Test server connection
   - Check firewall settings

## Performance Optimization

### PID Tuning
- Temperature Loop
  - P: 2.0
  - I: 5.0
  - D: 1.0
  - Sample time: 2000ms

- Humidity Loop
  - P: 2.0
  - I: 5.0
  - D: 1.0
  - Sample time: 2000ms

### Network Optimization
- Data transmission interval: 5000ms
- Sensor reading interval: 2000ms
- Motion check interval: 1000ms
- NTP sync interval: 3600000ms

## Development Guide

### Library Dependencies
- DHT Sensor Library
- ArduinoJson (v6+)
- ESP8266WiFi
- ESP8266HTTPClient
- NTPClient
- PID Library

### Build Instructions
1. Install Arduino IDE
2. Add ESP8266 board support
3. Install required libraries
4. Configure board settings
5. Upload firmware

### Debugging
- Serial monitor: 115200 baud
- Debug messages for all major operations
- Error codes for common issues
- State machine logging

## Assembly Instructions

### Required Tools
1. Soldering Iron (30-40W) with solder
2. Wire strippers
3. Heat shrink tubing
4. Multimeter
5. Small Phillips screwdriver
6. Hot glue gun
7. Wire cutters

### Components List
1. Electronics
   - ESP8266 NodeMCU Board
   - DHT22 Temperature/Humidity Sensor
   - HC-SR501 PIR Motion Sensor
   - 4x MOSFET IRF520N Modules
   - 12V to 5V Buck Converter
   - 12V 2A Power Supply
   - Breadboard or PCB
   - Jumper wires (male-to-male, male-to-female)
   - 10kΩ resistor (for DHT22)

2. Actuators
   - 12V Ceramic Heating Element (20W)
   - 12V Ultrasonic Mist Maker
   - 12V DC Fan (80mm)
   - 12V LED Strip (warm white)

3. Enclosure
   - Plastic project box (30x20x15cm)
   - Cable glands (5-6 pieces)
   - Mounting screws
   - Zip ties
   - Double-sided tape

### Step-by-Step Assembly

1. Prepare the Enclosure
   ```
   a. Drill holes for:
      - Cable glands (power, sensors, actuators)
      - Ventilation (fan mounting)
      - LED strip
      - Status LEDs
      - USB programming access
   
   b. Mount components:
      - Install cable glands
      - Secure fan with screws
      - Attach LED strip
      - Mount NodeMCU using standoffs
   ```

2. Power Supply Setup
   ```
   a. Connect 12V power supply to buck converter:
      - Red wire -> VIN+
      - Black wire -> VIN-
   
   b. Connect buck converter output:
      - 5V output -> NodeMCU VIN
      - GND -> NodeMCU GND
   ```

3. Sensor Connections
   ```
   a. DHT22 Temperature/Humidity Sensor:
      - VCC -> NodeMCU 3.3V
      - DATA -> D2 (with 10kΩ pullup to 3.3V)
      - GND -> NodeMCU GND
   
   b. PIR Motion Sensor:
      - VCC -> NodeMCU 3.3V
      - DATA -> D14
      - GND -> NodeMCU GND
   ```

4. Actuator Connections
   ```
   a. Heating Element (via MOSFET):
      - MOSFET VIN -> 12V
      - MOSFET SIG -> D4
      - MOSFET GND -> GND
      - Heater between MOSFET drain and 12V
   
   b. Humidifier (via MOSFET):
      - MOSFET VIN -> 12V
      - MOSFET SIG -> D5
      - MOSFET GND -> GND
      - Mist maker between MOSFET drain and 12V
   
   c. Fan (via MOSFET):
      - MOSFET VIN -> 12V
      - MOSFET SIG -> D12
      - MOSFET GND -> GND
      - Fan between MOSFET drain and 12V
   
   d. LED Strip (via MOSFET):
      - MOSFET VIN -> 12V
      - MOSFET SIG -> D13
      - MOSFET GND -> GND
      - LED strip between MOSFET drain and 12V
   ```

### Wiring Diagram
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

### Safety Considerations During Assembly

1. Power Safety
   - Always disconnect power before making connections
   - Double-check polarity of all connections
   - Use appropriate wire gauge (18-22 AWG recommended)
   - Insulate all connections properly

2. Component Protection
   - Use heat sinks on MOSFETs if needed
   - Keep water-generating components away from electronics
   - Ensure proper ventilation for all components
   - Use thermal paste for heating element contact

3. Testing Procedure
   ```
   a. Initial Power-Up:
      1. Check all connections
      2. Power up without actuators
      3. Verify 3.3V and 5V power rails
      4. Test WiFi connectivity
   
   b. Sensor Testing:
      1. Verify DHT22 readings
      2. Check motion sensor triggering
      3. Validate data transmission
   
   c. Actuator Testing:
      1. Test each MOSFET individually
      2. Verify PWM control
      3. Check for heating element function
      4. Test humidifier operation
      5. Confirm fan rotation
      6. Verify LED operation
   ```

### Maintenance Access

1. Component Layout
   - Place frequently maintained items near access panel
   - Route wires with service loops
   - Label all connections
   - Use terminal blocks for easy disconnection

2. Waterproofing
   - Seal all external holes with silicone
   - Use waterproof connectors for sensors
   - Apply conformal coating to PCB
   - Install drainage holes in appropriate locations 
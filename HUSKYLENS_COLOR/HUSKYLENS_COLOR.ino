/***************************************************
 GROUP 4

 sources used: https://github.com/HuskyLens/HUSKYLENSArduino/tree/master
*****************************************************/

#include "HUSKYLENS.h"
#include "Wire.h"
#include <AFMotor.h>

// Number of steps per output rotation
// Change this as per your motor's specification
const int stepsPerRevolution = 200;

// connect motor to port #2 (M3 and M4)
AF_Stepper motor(stepsPerRevolution, 2);
HUSKYLENS huskylens;
int index_pink = 0;
int index_yellow = 0;
int index_other = 0;
//HUSKYLENS green line >> SDA; blue line >> SCL
//HUSKYLENS yellow line >> GND; red line >> 5V
void setup() {
  Serial.begin(9600);
  Wire.begin();
  motor.setSpeed(20);
  //huskylens.setCustomName("Yellow",1);
  //huskylens.setCustomName("Pink" , 2);
  while (!huskylens.begin(Wire)) {
    //Serial.println("1.Please recheck the \"Protocol Type\" in HUSKYLENS (General Settings>>Protocol Type>>I2C)");
    //Serial.println("2.Please recheck the connection.");
    delay(100);
  }
  huskylens.writeAlgorithm(ALGORITHM_COLOR_RECOGNITION);  //Switch the algorithm to color recognition.
}

void loop() {
  if (Serial.available() > 0) {
    // Read the incoming data
    String data = Serial.readString();

    // Check if the data is the reset signal
    if (data == "RESET") {
      // Perform the reset operation
      index_pink = 0;
      index_yellow = 0;
      index_other = 0;
    }
  }
  if (!huskylens.request())
    ;
  else if (!huskylens.isLearned())
    ;
  else if (!huskylens.available())
    ;
  else {
    while (huskylens.available()) {
      int steps = 205;
      HUSKYLENSResult result = huskylens.read();
      if (result.command == COMMAND_RETURN_BLOCK) {
        if (result.ID == 1 && index_yellow < 4) {
          index_yellow++;
          //set the stepper motor to be at the initial position
            motor.step(140, FORWARD, INTERLEAVE);
            delay(200);
            motor.step(140, BACKWARD, INTERLEAVE);

        } else if (result.ID == 2 && index_pink < 4) {
          index_pink++;
          //set the stepper motor to be at the initial position + 120 degrees
            motor.step(140, BACKWARD, INTERLEAVE);
            delay(200);
            motor.step(140, FORWARD, INTERLEAVE);

        } else {
          index_other++;
        }
      }
      Serial.print(index_yellow);
      Serial.print(",");
      Serial.print(index_pink);
      Serial.print(",");
      Serial.print(index_other);
      Serial.println();
      delay(1000);
    }
  }
}

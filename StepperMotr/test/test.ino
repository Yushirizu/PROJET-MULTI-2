#include <AFMotor.h>

// Number of steps per output rotation
// Change this as per your motor's specification
const int stepsPerRevolution = 200;

// connect motor to port #2 (M3 and M4)
AF_Stepper motor(stepsPerRevolution, 2);

void setup() {
  Serial.begin(9600);
  Serial.println("Stepper test!");

  motor.setSpeed(20);  // 10 rpm   
}
  
void loop() {

  Serial.println("Double coil steps");
  /*Alternate between single and double to create a half-step in between.  This can result in smoother operation, but because of the extra half-step, the speed is reduced by half too.
MICROSTEP - Adjacent coils are ramped up and down to create */
  motor.step(140, FORWARD, INTERLEAVE);
  delay(200);
  motor.step(140, BACKWARD, INTERLEAVE);
  delay(1000);
}
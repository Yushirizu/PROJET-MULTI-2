/***************************************************
 GROUP 4

 sources used: https://github.com/HuskyLens/HUSKYLENSArduino/tree/master
*****************************************************/

#include "HUSKYLENS.h"
#include "SoftwareSerial.h"
#include <AFMotor.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 20, 4);

const int stepsPerRevolution = 200;
const int steps = 140;
AF_Stepper motor(stepsPerRevolution, 2);

HUSKYLENS huskylens;
SoftwareSerial mySerial(10, 11); // RX, TX

int index_pink = 0;
int index_yellow = 0;
int index_other = 0;

void print()
{
  Serial.print(index_yellow);
  Serial.print(",");
  Serial.print(index_pink);
  Serial.print(",");
  Serial.print(index_other);
  Serial.println();
  lcd.setCursor(2, 0);
  lcd.print("Y:");
  lcd.print(index_yellow);
  lcd.print(" ");
  lcd.print("P:");
  lcd.print(index_pink);
  lcd.print(" ");
  lcd.print("O:");
  lcd.print(index_other);
}
void setup()
{
  lcd.init(); // initialize the lcd
  lcd.backlight();
  Serial.begin(9600);
  motor.setSpeed(20);
  pinMode(3, INPUT_PULLUP);
  mySerial.begin(9600);
    while (!huskylens.begin(mySerial)) {
    Serial.println("1.Please recheck the \"Protocol Type\" in HUSKYLENS (General Settings>>Protocol Type>>I2C)");
    Serial.println("2.Please recheck the connection.");
    delay(100);
  }
  huskylens.writeAlgorithm(ALGORITHM_COLOR_RECOGNITION); // Switch the algorithm to color recognition.
}

void loop()
{
  if (Serial.available() > 0)
  {
    // Read the incoming data
    String data = Serial.readString();
    // Check if the data is the reset signal
    if (data == "RESET")
    {
      // Perform the reset operation
      index_pink = 0;
      index_yellow = 0;
      index_other = 0;

      lcd.setCursor(5, 0);
      lcd.print(0);
      lcd.print("-");
      lcd.print(0);
      lcd.print("-");
      lcd.print(0);
    }
  }
  if (!huskylens.request()) // Request data from HuskyLens.
    ;
  else if (!huskylens.isLearned()) // Check whether the HuskyLens has learned the data.
    ;
  else if (!huskylens.available()) // Check whether the data is available.
    ;
  else
  {
    while (huskylens.available()) // Read the data from HuskyLens.
    {
      HUSKYLENSResult result = huskylens.read();
      if (result.command == COMMAND_RETURN_BLOCK)
      {
        if (result.ID == 1 && index_yellow < 4)
        {
          index_yellow++;
          motor.step(steps, FORWARD, DOUBLE);
          delay(1000);
          motor.step(steps, BACKWARD, DOUBLE);
        }
        else if (result.ID == 2 && index_pink < 4)
        {
          index_pink++;
          motor.step(steps, BACKWARD, DOUBLE);
          delay(1000);
          motor.step(steps, FORWARD, DOUBLE);
        }
        else
        {
          index_other++;
        }
      }
      delay(500);
      print();
    }
  }
}

import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
const whilst = require("async/whilst");
let AWS = require("aws-sdk")
const sns = new AWS.SNS()
const docClient = new AWS.DynamoDB.DocumentClient()
 
// This method handles sending given message to given userID and phone number via SMS using AWS SNS API
// It also saves the copy of message, receipiant userID, phone number and timestamp in DynamoDB.
export const send_message: APIGatewayProxyHandler = async (event, _context) => {
  const errorCodes = {
    0: "internal error",
    1: "user_id is missing",
    2: "message is missing",
    3: "Receiver number is missing",
    4: "Error sending SMS message",
    5: "Error saving copy in DB"
  }
  if (event.body !== null && event.body !== undefined) {
    let body: any = JSON.parse(event.body)
    var userID: string = body.user_id
    var message: string = body.message
    var phoneNumber: string = body.phone_number
    if (userID != null && userID.trim() != "") {
      if (message != null && message.trim() != "") {
        if (phoneNumber != null && phoneNumber.trim() != "") {
          sns.publish({
            Message: message,
            MessageAttributes: {
              'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Promotional'
              },
              'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: "MONEYOUAPP"
              },
            },
            PhoneNumber: phoneNumber
          }).promise()
            .then((data) => {
              console.log("Successfully sent SMS")
              // Keep record in database
              var params = {
                TableName: "Messages",
                Item: {
                  userID,
                  message,
                  phoneNumber,
                  sentTime: new Date().getTime()
                }
              }
              docClient.put(params).promise()
                .then((data) => {
                  console.log("Successfully saved copy of message in DB")
                  return {
                    statusCode: 200,
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      message: "Successfully sent message and saved copy in DB."
                    })
                  }
                })
                .catch((error: any) => {
                  console.error("Saving copy of message in DB failed")
                  return {
                    statusCode: 500,
                    body: JSON.stringify({
                      error: {
                        code: 5,
                        headers: {
                          "Content-Type": "application/json"
                        },
                        message: errorCodes[5]
                      }
                    }, null, 2)
                  }
                })
            })
            .catch(err => {
              console.error("Sending SMS failed", err);
              return {
                statusCode: 500,
                body: JSON.stringify({
                  error: {
                    code: 4,
                    headers: {
                      "Content-Type": "application/json"
                    },
                    message: errorCodes[4]
                  }
                }, null, 2)
              }
            });
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({
              error: {
                code: 3,
                headers: {
                  "Content-Type": "application/json"
                },
                message: errorCodes[3]
              }
            }, null, 2)
          }
        }
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: {
              code: 2,
              headers: {
                "Content-Type": "application/json"
              },
              message: errorCodes[2]
            }
          }, null, 2)
        }
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: {
            code: 1,
            headers: {
              "Content-Type": "application/json"
            },
            message: errorCodes[1]
          }
        }, null, 2)
      }
    }
  }
}

// This method handles returning all the messages sent to given userID in descending order by time they were sent
export const get_all_messages: APIGatewayProxyHandler = async (event, _context) => {
  const errorCodes: Object = {
    0: "internal error",
    1: "user_id is missing",
    2: "error reading messages from DB"
  }

  var userID = event.queryStringParameters.user_id
  if (userID != null && userID.trim() != "") {
    var params = {
      TableName: "Messages",
      KeyConditionExpression: "userID = :userID",
      ExpressionAttributeValues: {
        ":userID": userID
      },
      ScanIndexForward: false
    }

    var LastEvaluatedKey = null
    var messages = []
    var shouldMakeQuery = true
    var encounteredError = false

    // Here I have used async.whilst function to chain async function calls in while loop format
    // https://caolan.github.io/async/v3/docs.html#whilst
    whilst(
      function () {
        return shouldMakeQuery
      },
      function () {
        if (LastEvaluatedKey != null) {
          params["ExclusiveStartKey"] = LastEvaluatedKey
        }
        docClient.query(params).promise()
          .then((data) => {
            if (data.Items != null) {
              data.Items.forEach(message => {
                messages.push(message)
              });
            }
            LastEvaluatedKey = data.LastEvaluatedKey
            if (LastEvaluatedKey == undefined || LastEvaluatedKey == null) {
              shouldMakeQuery = false
            }
          })
          .catch((error) => {
            console.error("When requested to get all the messages sent to user, received error " + error.toString())
            encounteredError = true
            shouldMakeQuery = false
          })
      }
    ).promise()
      .then(() => {
        if (encounteredError) {
          const errorCode = 2
          return {
            statusCode: 500,
            body: JSON.stringify({
              error: {
                error: {
                  code: errorCode,
                  message: errorCodes[errorCode]
                }
              }
            })
          }
        } else {
          return {
            statusCode: 200,
            body: JSON.stringify({
              data: {
                messages
              }
            })
          }
        }
      })
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          code: 1,
          message: errorCodes[1]
        }
      })
    }
  }
}

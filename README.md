# Messenger
Module in Typescript for sending SMS with SNS API and saving it in DynamoDB.

[messenger.ts](https://github.com/patelatharva/messenger/blob/master/messenger.ts) contains handler functions for sending, saving and retrieving messages.

[serverless.yml](https://github.com/patelatharva/messenger/blob/master/serverless.yml) contains configuration of functions, mappings to HTTP methods, AWS IAM Role permissions for this Lambda function and pointers to resources such as DynamoDB table to be created.

[resources/dynamodb-table.yml](https://github.com/patelatharva/messenger/blob/master/resources/dynamodb-table.yml) contains description of table to be created for storing messages sent.

### How to deploy
This module can be deployed using AWS platform specific instructions given by [serverless](https://serverless.com/framework/docs/providers/aws/guide/deploying/).

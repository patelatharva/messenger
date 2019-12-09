# Messenger
Module in Typescript for sending SMS with SNS API and saving it in DynamoDB.

[messenger.ts](https://github.com/patelatharva/messenger/blob/master/messenger.ts) contains handler functions for sending, saving and retrieving messages.

[serverless.yml](https://github.com/patelatharva/messenger/blob/master/serverless.yml) contains configuration of functions, mappings to HTTP methods, AWS IAM Role permissions for this Lambda function and pointers to resources such as DynamoDB table to be created.

[resources/dynamodb-table.yml](https://github.com/patelatharva/messenger/blob/master/resources/dynamodb-table.yml) contains description of table to be created for storing messages sent.

### How to deploy
This module can be deployed using AWS platform specific instructions given by [serverless](https://serverless.com/framework/docs/providers/aws/guide/deploying/) and after [setting up credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

### Ideas for improvement and things to keep in mind as the module grows:
1. Using authentication mechanism to restrict API access to only authorized clients by including some security access token while performing each request and verifying the validity and access permissions associated with that token, to check if the client is authorized to perform the requested actions.
2. Keeping the permissions related to performing different actions on AWS resources as specified in `iamRoleStatements` in `serverless.yml` to be as minimal as possible just enough so that the module is able to perform its intended tasks.
3. Setting `stage` variable and using it while naming resources such that different resources are created for different environment during dev, test and production stages possibly for each developer.

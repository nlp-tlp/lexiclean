# Hosting LexiClean on AWS

<!-- ## Deployment

To deploy the system so that you can self-host a collaborative environment, please reach out to us. We are currently hosting LexiClean on AWS infrastructure using AWS Lambda and S3 with Route 53 and CloudFront. We use Auth0 as a third-party authentication provider which is bundled with the LexiClean code in the backend and client.

## Connecting to MongoDB Atlas

## Deploying on AWS S3 and Lambda

### Backend

AWS Lambda for Express Server

- Zip the file contents in `./backend` to create `backend.zip`
- Upload zip file to Lambda functon
- Ensure that in the Runetime setings the lambda entry point is `backend/lambda.handler`

Create an API Gateway to interface with Lambda and proxy to AWS S3 static build files

- Create new API
  - Choose REST API
  - API Name: LexiCleanStaging or whatever you want LexiCleanProd/Dev, etc.
  - Keep defaults

Inside the new REST API

- Click 'create method'

  - select method type "any"
  - Select Lamnda function
  - choose lambda function (e.g. `LexiClean-Staging` whatever you called your lambda fnc)
  - keep defaults for the rest
  - click create

- Create 'new resource'
  - Click "proxy resource"
  - add resource name `{proxy+}`
  - Click create resource

On the new `ANY` under `/{proxy+}

- Click edit integration
- select lambda function integration type
- choose lambda function (e.g. `LexiClean-Staging` whatever you called your lambda fnc)
- keep defaults

deploy API

- click deploy api

### Frontend

Build react app:

```bash

npm run build

```

Host app on AWS S3

- Create an S3 bucket
- Upload build artifacts
- Static web hosting
- bucket policy

Connect frontend to lambda via API Gateway -->

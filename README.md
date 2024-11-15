# Serverless Framework Python Flask API + Static Website Hosting on AWS

## Prerequisite

### Install NPM and Node:

#### Install NVM:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

To test that nvm was properly installed, close and re-open Terminal and enter nvm. If you get a nvm: command not found message, your OS may not have the necessary .bash_profile file. In Terminal, enter touch ~/.bash_profile and run the above install script again.  For Windows users, navigate to https://github.com/coreybutler/nvm-windows/releases and download `nvm-setup.exe`.

#### Install Node 21:

```
nvm install 21
```
**For Windows users**

The above command may only work in administrator mode.  After installing, return to your standard command prompt and run

```
nvm use 21
```

**For non-Windows users**

In order to access node and npm as sudo (in order to have <1024 ports) you should run

```
n=$(which node)
n=${n%/bin/node}
chmod -R 755 $n/bin/* 
sudo cp -r $n/{bin,lib,share} /usr/local 
```

### Install Serverless:

```
npm install -g serverless
```

(May only work in administrator mode for Windows users)

### Setup AWS Credentials:

**For non-Windows users**

Create AWS Credentials file ` ~/.aws/credentials` and populate it with:

```
[default]
aws_access_key_id=<ACCESS-KEY>
aws_secret_access_key=<SECRET-ACCESS-KEY>
```

and replace `<ACCESS-KEY>` and `<SECRET-ACCESS-KEY>` with your keys.

Create AWS Config file ` ~/.aws/config` and populate it with:

```
[default]
region=us-east-1
output=json
```

**For Windows users**

Installing AWS command-line interface (if not installed already):

```
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

Confirm installation:
```
aws --version
```

To configure credentials and config files, run the following command:

```
aws configure
```

You will be prompted to enter your access and secret access keys, followed by the default region name (`us-east-1`) and output format (`json`).  The ` ~/.aws/credentials` and ` ~/.aws/config` files will be automatically generated with the correct information.

## Usage

### Deployment

Make sure you are in the current project directory.

In order to deploy with dashboard, you need to first login/register with:

```
serverless login
```

install dependencies with:

```
npm install
```

and

```
pip install -r requirements.txt
```

and then perform deployment with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "aws-python-flask-api" to stage "dev" (us-east-1)

Using Python specified in "runtime": python3.9

Packaging Python WSGI handler...

✔ Service deployed to stack aws-python-flask-api-dev (104s)

endpoints:
  ANY - https://xxxxxxxxxe.execute-api.us-east-1.amazonaws.com/dev/
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  api: aws-python-flask-api-dev-api (41 MB)

```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

Which should result in the following response:

```json
{ "message": "Hello from root!" }
```

Calling the `/hello` path with:

```
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/hello
```

Should result in the following response:

```json
{ "message": "Hello from path!" }
```

Calling the `/read_csv` path with:

```
curl -X POST -H "Content-Type: application/json" -d '{"file_name": "path_to_your_csv_file.csv"}' https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/read_csv
```

Should return data of csv files in JSON format.

### Local development

Thanks to capabilities of `serverless-wsgi`, it is also possible to run your application locally, however, in order to do that, you will need to first install `werkzeug` dependency, as well as all other dependencies listed in `requirements.txt`. It is recommended to use a dedicated virtual environment for that purpose. You can install all needed dependencies with the following commands:

```
pip install werkzeug
pip install -r requirements.txt
```

At this point, you can run your application locally with the following command:

```
serverless wsgi serve
```

For additional local development capabilities of `serverless-wsgi` plugin, please refer to corresponding [GitHub repository](https://github.com/logandk/serverless-wsgi).

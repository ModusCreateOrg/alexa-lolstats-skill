# Alexa Custom Skill: League of Legends Stat Finder

**NOTICE: this project is still in development and has limited functionality**

This repo contains the Intents, Sample Utterances, and Lambda functions to set up a custom skill for Amazon Echo using 
AWS Lambda and Node JS, that returns stat information for League of Legend players.

## Current functionality:
- Get summoner's rank
- Get summoner's most played Champion in the last 10 Normal Games

# Setup for Lambda function:

1. Once you've cloned the repository, from the root folder do:

 ```
 npm install
 ```

 This will install the packages `isomorphic-fetch` and `es6-promise`. The first is just a simple plugin we use to get API calls and return them as JSON and the second polyfills our es6 promises.

2. Open up the index.js file. There are 3 fields that need to be filled in.
 * `var API_BASE = "<your_riot_api_key>` - the string value should be replaced with your personal 
 developer API KEY from your developer account with Riot.
 If you don't have one, start here [Riot Developer Site](https://developer.riotgames.com/)
 * `var SUMMONER_ID = "<your_summoner_id>` - the string value should be replaced with your personal summoner ID.
 This can also be found on the [Riot Developer Site](https://developer.riotgames.com/) by logging into your account
 and clicking the 'My Account' link in the top right corner.
 * `event.session.application.applicationId != "<your_app_id>"` - the string value should be replaced with your Alexa Skill
 application ID. This is generated when you create a new Alexa Skill from Amazon's Developer Site. If you have no idea how
 to do this, I would encourage you to check out @simonprickett 's Guide to building custom Alexa Skills [here]()
 
3. Once all this has been done, zip up the `index.js`, `package.json`, and `node_modules` files. <br>
**Important: zip the files, and not the directory they live in.**

4. Upload your function zip file to AWS Lambda. Guide for that can be found here 
[Create a NodeJS Package for AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html)

5. Once the function is created in AWS, grab the ARN from the top right corner of the AWS Lambda Browser UI

6. When prompted in your Alexa Skill creation process, enter the ARN into the appropriate text field
 ![Screenshot](/screenshots/arn-input.png)

# Wrap Up

And that's it! your function is added to the skill and you can begin testing your skill in the Alexa console. Again, if you need help with this, I advise you check out Simon's blog post above.


--  shoutout to @simonprickett for help with troubleshooting and being the inspiration for the project in the first place. Shoutout to @dmackerman for tips on handling API requests.

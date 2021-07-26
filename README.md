# sshbot

## What is sshbot?
### Introduction
sshbot is a simple Discord bot designed for allowing users to run and execute commands on a remote machine using the SSH2 library for NodeJS. This can be used for anything from an Amazon EC2 instance, a Raspberry Pi or even your main PC.

![example](https://imgur.com/jAPiMlh.png "example")

### Uses and Limitations
While the bot is mostly for fun, it can be used for just about anything that can be done on a remote machine through SSH. This includes running and compiling code, installing software and having entire conversations through cowsay. Unfortunately, since Discord is a limited interface, the bot cannot print responses over 2000 characters or display the output from programs that don't immediately terminate such as Vim.

## Running sshbot
### Getting Everything Ready
The first step for running this bot is to clone the Git repository and download all the bots dependencies through NPM. This can be done through a shell terminal with the following commands.
```sh
git clone https://github.com/dominictoms/sshbot.git
cd sshbot
npm install
```

### Environment Variables
For security reasons, all the secrets needed to run the bot are stored as environment variables in a file called `.env`. To add all your environment variables, simply create the file and use a text editor to add your values. The file should look like the following example.
```sh
DISCORD_KEY = abcdefghijk...
SSH_HOST = 127.0.0.1
SSH_PORT = 22
SSH_USER = dominictoms
SSH_KEY = ./sshkey.pem
```

### Configuring the Bot
You can configure the bot to meet your specific needs through the `config.json` file. The config file should look like the example below.
```json
{
	"prefix": "$",
	"roles": ["admin", "mod"]
}
```
Please note that if you want anyone in the server to have access to the bot, the `roles` array should contain `"@everyone"` as an element.

### Running the Bot
Now that everything has been set up it's time to run the bot. The bot can be run locally with the following command.
```sh
node .
```
While running the bot locally is pretty cool, I would recommend using a service such as Docker to store the app in a container and then running the container on a secure server to maximize the applications speed and uptime.

## Using sshbot
### Running a Command
Once the bot is up and running in your server, usage is incredibly simple. Simply type the prefix you specified in the config file followed by the command you want to run on your remote machine. For example, if the prefix is `$` and you want to run `whoami`, you would type `$ whoami`.

![example](https://imgur.com/VZd1dFl.png "example")

### Uploading a File
You can upload files to your 


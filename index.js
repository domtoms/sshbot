// discord api
const Discord = require("discord.js");
const bot = new Discord.Client();

// ssh api
const { Client } = require("ssh2");

// for reading ssh key
const { readFileSync } = require("fs");

// for enviroment variables
require("dotenv").config();

// config file
var config = require("./config.json");

// help embed file
var help = require("./help.json");

// on bot start
bot.on("ready", () =>
{
	// set the bot activity
	bot.user.setActivity(config.prefix + "help", {type: "PLAYING"}); 
});

// on a new message
bot.on("message", (msg) =>
{
	// fuck off outta here
	if (!msg.content.startsWith(config.prefix)) return;

	// user doesn't have permission
	if (!hasRole(msg))
	{
		// tell the user they don't have permission
		msg.channel.send("You do not have the permissions to use this bot :pensive:");
		return;
	}

	// remove the prefix
	msg.content = msg.content.substring(config.prefix.length);

	// trim the fat
	msg.content = msg.content.trim();

	// split the message into an array
	var args = msg.content.split(" ");

	// check first argument
	switch (args[0])
	{
		// help argument
		case "help":
			// send help message
			msg.channel.send(help);
			break;

		// otherwise execute command
		default:
			// output command
			exec(msg);
	}
});

// execute a shell command
function exec(msg)
{
	// create a new client
	const ssh = new Client();

	// connect client to the ec2 instance
	ssh.connect(
	{
		// read variables from env variables
		host: process.env.SSH_HOST,
		port: process.env.SSH_PORT,
		username: process.env.SSH_USER,
		privateKey: readFileSync(process.env.SSH_KEY)
	});

	// ready to go
	ssh.on("ready", () =>
	{
		// string to store the response
		var resp = "";

		// execute the command
		ssh.exec(msg.content, (err, stream) =>
		{
			// begone
			if (err) throw err;

			// when command finished
			stream.on("close", (code, signal) =>
			{
				// remove all the ansi
				resp = resp.replace(/(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g, "");

				// response is too long
				if (resp.length > 1993)
					msg.channel.send("Response is over 2000 chars :pensive:");

				// response is empty
				else if (resp.length === 0)
					msg.channel.send("No response received :pensive:");

				// otherwise send the response
				else
					msg.channel.send("```\n" + resp + "```");

				// end the connection
				return ssh.end();
			})

			// for each line
			.on("data", (data) =>
			{
				// add the line to the output
				resp += data;
			})
		});
	})
}


// check if member has role
function hasRole(msg)
{
	// compare the roles
	for (role in config.roles)
		if (msg.member.roles.cache.some(r => r.name === config.roles[role]))
			return true;

	// otherwise return false
	return false;
}

// login to the discord bot!
bot.login(process.env.DISCORD_KEY);

// discord api
const Discord = require("discord.js");
const bot = new Discord.Client();

// ssh api
const { Client } = require("ssh2");

// for reading ssh key
const { readFileSync } = require("fs");

// for enviroment variables
require('dotenv').config();

// on bot start
bot.on("ready", () =>
{
	// set the bot activity
	bot.user.setActivity("$help", {type: "PLAYING"}); 
});

// on a new message
bot.on("message", (msg) =>
{
	// fuck off outta here
	if (!msg.content.startsWith("$")) return;

	// remove the first char of msg
	msg.content = msg.content.substring(1);

	// trim the fat
	msg.content = msg.content.trim();

	// split the message into an array
	var args = msg.content.split(" ");

	switch (args[0])
	{
		case "help":
			// send help message
			msg.channel.send("Just type `$ your-command-here` to run a shell command!");
			break;

		default:
			// output command
			exec (msg);
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
		ssh.exec(mgs.content, (err, stream) =>
		{
			// begone
			if (err) throw err;

			// when command finished
			stream.on("close", (code, signal) =>
			{
				// remove all the ansi
				resp = resp.replace(/(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g, "");

				// response is too long
				if (resp.length > 1999)
					msg.channel.send("Response is over 2000 chars :(");

				// response is empty
				else if (resp.length === 0)
					msg.channel.send("No response received :(");

				// otherwise send the response
				else
					msg.channel.send("```\n" + resp + "```");

				// end the connection
				return ssh.end();

			// for each line
			}).on("data", (data) =>
			{
				// add the line to the output
				resp += data;
			})
		});
	})
}

// todo store in env variable
bot.login(process.env.DISCORD_KEY);

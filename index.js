// dependencies
const Discord = require("discord.js");
const bot = new Discord.Client();
const { Client } = require("ssh2");
const sftpClient = require("ssh2-sftp-client");
const https = require("https");
const fs = require("fs");
const dotenv = require("dotenv").config();

// json files
const config = require("./config.json");
const help = require("./help.json");

// config for ssh
const sshConfig =
{
	host: process.env.SSH_HOST,
	port: process.env.SSH_PORT,
	username: process.env.SSH_USER,
	privateKey: fs.readFileSync(process.env.SSH_KEY)
};

bot.on("ready", () =>
{
	// set the bot activity
	bot.user.setActivity(config.prefix + "help", {type: "PLAYING"}); 
});

bot.on("message", (msg) =>
{
	// return if no prefix
	if (!msg.content.startsWith(config.prefix)) return;

	// user doesn't have permission
	if (!hasRole(msg))
	{
		msg.channel.send("You do not have the permissions to use this bot :pensive:");
		return;
	}

	// remove the prefix
	msg.content = msg.content.substring(config.prefix.length);

	// split the message into an array
	var args = msg.content.split(" ");

	// remove any blank entries
	while (args.indexOf("") != -1)
		args.splice(args.indexOf(""), 1);

	// check first argument
	switch (args[0])
	{
		case "help":
			msg.channel.send(help);
			break;

		case "upload":
			download(msg, args[1]);
			break;

		// otherwise, run the command
		default:
			exec(msg);
	}
});

function exec(msg)
{
	// create a new client
	const ssh = new Client();

	// connect to the instance
	ssh.connect(sshConfig);

	// ready to go
	ssh.on("ready", () =>
	{
		// string to store the response
		var resp = "";

		ssh.exec(msg.content, (err, stream) =>
		{
			// begone
			if (err) throw err;

			// on stream end
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

			// on each line
			.on("data", (data) =>
			{
				// add the line to the output
				resp += data;
			})
		});
	})
}

function download(msg, dir)
{
	// ensure message has attachment
	if (!msg.attachments.size)
	{
		msg.channel.send("No file in message :pensive:");
		return;
	}

	// directory to save temp files
	const downloadDir = __dirname + "/downloads/";

	// create downloads folder if doesn't exist
	if (!fs.existsSync(downloadDir))
		fs.mkdirSync(downloadDir);

	// loop through attachments
	msg.attachments.forEach(attachment =>
	{
		// create file
		const file = fs.createWriteStream(downloadDir + attachment.name);

		// download the file 
		const request = https.get(attachment.url, (response) =>
		{
			response.pipe(file);

			// now time to upload the file
			upload(msg, dir, downloadDir, attachment);
		})

	});
}

function upload(msg, dir, downloadDir, attachment)
{
	// create a new client
	const sftp = new sftpClient();

	// local and remote directories
	const local = fs.createReadStream(downloadDir + attachment.name);
	const remote = dir ? dir : attachment.name;

	// connect to the instance
	sftp.connect(sshConfig)

	// upload the file
	.then(() =>
	{
		return sftp.put(local, remote);
	})

	// once file uploaded
	.then(() =>
	{
		// delete the file
		fs.unlinkSync(downloadDir + attachment.name);

		// confirm the file is uploaded
		msg.channel.send("File uploaded succesfully :smiley:")

		// end the connection
		return sftp.end();
	})

	// on error
	.catch(err =>
	{
		// delete the file
		fs.unlinkSync(downloadDir + attachment.name);

		// tell the user upload failed
		msg.channel.send("Something went wrong :pensive:");
	});
}

// check if member has role
function hasRole(msg)
{
	// compare the roles
	for (var role in config.roles)
		if (msg.member.roles.cache.some(r => r.name === config.roles[role]))
			return true;

	// otherwise return false
	return false;
}


// login to the discord bot
bot.login(process.env.DISCORD_KEY);

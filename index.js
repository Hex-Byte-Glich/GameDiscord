const { Client, IntentsBitField, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

//database
const mongoose = require('mongoose');

//prefix bot
const { prefix } = require('./config.json');

//users Handle
const { initializeUserIds } = require('./Handle/UserManage');

//detectfunction
const { detectMessage } = require('./Handle/Message');
//@Meatra
const client = new Client({ //096 544 7881
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMessageReactions,

    ],
    shards: [0],
    shardCount: 1
});

const { ClusterClient } = require('discord-hybrid-sharding');

client.cluster = new ClusterClient(client);

// .env calling bot
const dotenv = require('dotenv');
const fs = require('fs')
const path = require('path');

client.commands = new Collection();

// Load command files
const commandFiles = [
    'help.js',
    'ping.js'
]; 
// List your command files
for (const file of commandFiles) {
    const command = require(`./CommandSlash/${file}`);
    client.commands.set(command.name, command);
}

// Load environment variables from .env file
dotenv.config();

(async () => {
    try {
        //console.log('Started refreshing application (/) commands.');

        const commands = Array.from(client.commands.values()).map(command => ({
            name: command.name,
            description: command.description,
            options: command.options || [],
        }));

        // Log the command prefix and registered commands for debugging
        console.log(`\n============================`);
        console.log(`      CommandSlash Info       `);
        console.log(`============================`);
        //console.log(`Command Prefix: ${commandPrefix}`);
        console.log(`\nCommands to be registered:`);

        commands.forEach(command => {
            console.log(`\n- ${command.name}: [${command.description}]`);
        });

        console.log(`\n============================\n`);
        // Log the commands for debugging
        // console.log('Commands to be registered:', commands); 

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        
        // Register commands for a specific guild
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // Register globally
            { body: commands },
        );


        // Connect to MongoDB
        await mongoose.connect(process.env.DATA_MONGOOSE);
        await initializeUserIds();
        //console.log(initializeUserIds);
        //console.log('Successfully connected to MongoDB.');
        //console.log('Successfully reloaded application (/) commands for the guild.');

    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', async () => {

    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`BOT PREFIX: ${prefix}`)
    
    if (typeof detectMessage === 'function') {
        detectMessage(client);
    } else {
        console.error('detectMessage is not a function');
    }
    
});
  
client.login(process.env.TOKEN);    
try {
    const { PermissionsBitField,EmbedBuilder,ButtonBuilder } = require('discord.js');
    const mongoose = require('mongoose');
    const { mongooseData } = require('../users/user');
    const User = mongoose.model('User', mongooseData);

    require('dotenv').config();
    const { getUser, ButtonStyle, oneButton, twoButton, labelButton, getCollectionButton, sym } = require('../Functions/function');
    const config = require('../config.json');
    const fs = require('fs');
    let banlist = [];
    let serverlist = [];
    const Owner = '';

    const AUTOMATION_THRESHOLD = 5;
    const TIME_WINDOW = 10000;
    let messageCache = {};

    const userFirstCommandTimes = new Map();
    const TIMES = 1 * 60 * 60 * 1000;

    async function getAllUsers() {
        // Replace this with your actual database call
        return await User.find(); // Example using Mongoose
    }

    function detectMessage(client) {

        const { 
            getCore,
            getSlashCommands,
            getAdmin,
            getSecurity
        } = require('./commandsHandle');

        client.on('messageCreate', async (message) => {

            banlist = JSON.parse(fs.readFileSync('./banlist.json', 'utf8'));
            serverlist = JSON.parse(fs.readFileSync('../Loto/banServerlist.json', 'utf8'));

            if (banlist.includes(message.author.id) || serverlist.includes(message.guildId) || message.content == 'ok') { return; }

            const guildPrefix = getGuildPrefix(message.guild.id);
            const messageContent = message.content;
            const lowerCaseMessageContent = messageContent.toLowerCase();

            if (!(lowerCaseMessageContent.startsWith(guildPrefix.toLowerCase()) || lowerCaseMessageContent.startsWith(config.prefix.toLowerCase())) || message.author.bot) { return; }

            const botMember = message.guild.members.me;

            if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.SendMessages)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.ManageMessages)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.AttachFiles)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.AddReactions)) {
                return;
            } else if (!botMember.permissionsIn(message.channel).has(PermissionsBitField.Flags.ReadMessageHistory)) {
                return;
            }
            
            function hasRequiredPermissions(member, channel) {
                const requiredPermissions = [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ManageMessages,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.AttachFiles,
                    PermissionsBitField.Flags.AddReactions,
                    PermissionsBitField.Flags.ReadMessageHistory
                ];
                const botPermissions = member.permissionsIn(channel);
                return requiredPermissions.every(perm => botPermissions.has(perm));
            }

            const userId = message.author.id;
            const content = message.content;

            if (!messageCache[userId]) {
                messageCache[userId] = [];
            }

            messageCache[userId].push({ content, timestamp: Date.now() });
            messageCache[userId] = messageCache[userId].filter(msg => msg.timestamp > Date.now() - TIME_WINDOW);
            const similarMessages = messageCache[userId].filter(msg => msg.content === content).length;

            const currentTime = new Date().getTime();
            if (!userFirstCommandTimes.has(userId)) {
                userFirstCommandTimes.set(userId, currentTime);
            }
            if (userFirstCommandTimes.has(userId)) {
                const collector = message.channel.createMessageCollector({
                    filter: (msg) => msg.author.id === message.author.id,
                    time: 300_000,
                    max: 1,
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        userFirstCommandTimes.delete(userId);
                    }
                });
            }
            if (currentTime - userFirstCommandTimes.get(userId) >= TIMES || similarMessages >= AUTOMATION_THRESHOLD) {
                userFirstCommandTimes.delete(userId);

                const banlist = loadBanlist();
                if (!banlist.includes(userId)) {
                    banlist.push(userId);
                    saveBanlist(banlist);
                }
                const verify = labelButton('verify', 'Verify', ButtonStyle.Primary);
                const allButton = oneButton(verify);
                const mgs = await message.reply({ content: '`You Need To verify because you have 6minutes for see this button | alright if you do not click on button it will die button and you can not verify\njust contact Owner for verify`🚫', components: [allButton] });
                const timedd = 60_000;

                const collector = getCollectionButton(mgs, timedd);

                collector.on('collect', async (interaction) => {
                    if (interaction.member.user.id != userId) { await interaction.reply({ content: `This Button is not for you`, ephemeral: true, }); return; }

                    if (interaction.customId == 'verify') {
                        verify.setDisabled(true);

                        if (banlist.includes(userId)) {
                            const updatedBanlist = banlist.filter(id => id !== userId);
                            saveBanlist(updatedBanlist);
                        }

                        await interaction.update({ content: `${sym}Verified you are human🌻${sym}`, components: [allButton] });
                        try {
                            const hostUser = client.users.cache.get(userId);
                            if (hostUser) { await hostUser.send('`Verified you are human!`🌻'); }
                        } catch (error) { }
                        collector.stop();
                        return;
                    }
                    
                });

                collector.on('end', async (collected, reason) => {
                    if (reason == 'time') {
                        try {
                            const hostUser = client.users.cache.get(userId);
                            if (hostUser) { await hostUser.send('`To verify you are human DM to Admin because are sus of using auto farm or selfbot!`🚫'); }
                        } catch (error) { }
                        mgs.edit({ components: [] });
                        collector.stop();
                        return;
                    }
                });

                return;
            }

            // Define all developer IDs in an array
            const devIds = [
                process.env.DEVID,
            ];
            const actualPrefix = lowerCaseMessageContent.startsWith(guildPrefix.toLowerCase()) ? guildPrefix : config.prefix;

            const args = messageContent.slice(actualPrefix.length).trim().split(/ +/);
            let commandName = args.shift().toLowerCase();

          //  let userData = await getUser(message.author.id);
          //  if (!userData) {
          //      userData = new User({
          //          userId: message.author.id,
          //          balance: 50000
            //    });
           //     await userData.save();
           // }
           // if (!userData.username) { userData.username = `${message.author.username}`; };

            //leveling(message);
            //prem(message);

            if (commandName == 'leaveserver' || commandName == 'nextday' || commandName == 'increasepointxp' || commandName == 'plusl' || commandName == 'dm' || commandName == 'adminhelp' || commandName == 'delall' || commandName == 'checkverifications' || commandName == 'checkvf' || commandName == 'cleargem' || commandName == 'amh' || commandName == 'clear' || commandName == 'transfercash' || commandName == 'tc' || commandName == 'get' || commandName == 'add' || commandName == 'setup' || commandName == 'setlevel' || commandName == 'slvl' || commandName == 'st' || commandName =='restartbot' ||commandName =='rb' || commandName == 'clearmessage' || commandName == 'cm' || commandName == 'del' || commandName == 'grant' || commandName == 'unequipe' || commandName == 'dron'|| commandName == 'clearcash' || commandName == 'tr' || commandName == 'blacklist' ||  commandName == 'serverlist' || commandName == 'whitelist' || commandName == 'wen' || commandName == 'find' || commandName == 'streak' || commandName == 'verify' || commandName == 'vf') {
                if (commandName == 'cc') { commandName = 'clearcash'; }
                if (commandName == 'cg') { commandName = 'cleargem'; }
                else if (commandName == 'vf') { commandName = 'verify'; }
                else if (commandName == 'cm') { commandName = 'clearmessage'; }
                else if (commandName == 'rb') { commandName = 'restartbot'; }
                else if (commandName == 'st') { commandName = 'setup'; }
                else if (commandName == 'slvl') { commandName = 'setlevel'; }
                else if (commandName == 'tc') { commandName = 'transfercash'; }
                else if (commandName == 'amh') { commandName = 'adminhelp'; }
                else if (commandName == 'checkvf') { commandName = 'checkverifications'; }
                else if (commandName == 'plusl') { commandName = 'pluslevel'; }

                const admin = getAdmin.get(commandName) || getAdmin.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!admin) return;

                // Checking for specific commands and developer access
                if (message.author.id === '830358159498674206' && commandName === 'nextday') {
                    admin.execute(client, message, args);
                    return;
                }

                // Check if the author's ID is in the list of developer IDs
                if (devIds.includes(message.author.id)) {
                    admin.execute(client, message, args);
                    return;
                }

            }else if (commandName == 'help' || commandName == 'ping') {

                const Core = getCore.get(commandName) || getCore.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!Core) return;

                Core.execute(client, message, args);
                return;
            }else if (commandName == 'setupantinuke') {

                const security = getSecurity.get(commandName) || getSecurity.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!security) return;

                security.execute(client, message, args);
                return;
            }
                
        });

        client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                const { commandName } = interaction;
                const command = getSlashCommands.get(commandName);

                if (!command) return;

                try {
                    await command.execute(interaction, client);
                } catch (error) {
                    console.error(`slach commands error : ${error}`);
                }
            }
        });
    }

    function getGuildPrefix(guildId) {
        return config.prefixes[guildId] || config.prefix;
    }
    function loadBanlist() {
        try {
            const data = fs.readFileSync('./banlist.json', 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading banlist:', error);
            return [];
        }
    }

    function saveBanlist(banlist) {
        try {
            fs.writeFile('./banlist.json', JSON.stringify(banlist), (err) => {
                if (err) {
                    console.error('Error saving banlist:', err);
                }
            });
        } catch (error) {
            console.error('Error saving banlist:', error);
        }
    }

    setInterval(() => {
        const currentTime = new Date();
        userFirstCommandTimes.forEach((firstCommandTime, userId) => {
            if (currentTime - firstCommandTime >= 10000) {

            }
        });
    }, 10000);

    module.exports = { detectMessage };

} catch (error) {
    console.log(`error detectMessage : ${error}`);
}
const { Client, IntentsBitField, Collection, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle, AttachmentBuilder, InteractionCollector,GuildMember } = require('discord.js');
const { prefix } = require('../config.json');
const fs = require('fs');
const mongoose = require('mongoose');
const { mongooseData } = require('../users/user');
const User = mongoose.model('User', mongooseData);
require('dotenv').config();

const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
    ]
});

//xp to level
function xpToLevel(xp){
    let lvl = 1;
    let rateXp = 1001;
    while(xp >= rateXp){
        lvl += 1;
        rateXp *= 1.5;
    }
    return lvl;
}

//xp rate
function xpToRateXp(xp){
    let lvl = 1;
    let rateXp = 1001;
    while(xp >= rateXp){
        lvl += 1;
        rateXp *= 1.5;
    }
    const RateXP = parseInt(rateXp);
    return RateXP.toLocaleString();
}

//Hours Time
function mileToHour(time){
    let hours = 0;
    let mins = 0;
    let secs = 0;

    while(time != 0){
        if(time >= 1000){
            secs += 1;
            time -= 1000;
        }
        if(secs >= 60){
            mins += 1;
            secs -= 60;
        }
        if(mins >= 60){
            hours += 1;
            mins -= 60;
        }
    }
    return hours;
}

//Minutes Time
function mileToMin(time){
    let hours = 0;
    let mins = 0;
    let secs = 0;

    while(time != 0){
        if(time >= 1000){
            secs += 1;
            time -= 1000;
        }
        if(secs >= 60){
            mins += 1;
            secs -= 60;
        }
        if(mins >= 60){
            hours += 1;
            mins -= 60;
        }
    }
    return mins;
}

//Seconds Times
function mileToSec(time){
    let hours = 0;
    let mins = 0;
    let secs = 0;

    while(time != 0){
        if(time >= 1000){
            secs += 1;
            time -= 1000;
        }
        if(secs >= 60){
            mins += 1;
            secs -= 60;
        }
        if(mins >= 60){
            hours += 1;
            mins -= 60;
        }
    }
    return secs;
}

//randomINT
function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

//time sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//get file to user in commands
function getFiles(commandFiles, dir){
    bot.commands = new Collection();
    for (const file of commandFiles) {
        const command = require(`${dir}/${file}`);
        bot.commands.set(command.name, command);
    }
    const result = bot.commands;
    return result;
}

//getUser From mongoose Database
async function getUser(id) {
    let userData = await User.findOne({ userID: id });
    return userData;
}

//UI Form in discord simple
function SimpleEmbed(text){
    return new EmbedBuilder()
        .setColor('#03adfc')
        .setDescription(text)
}

//UI Form in discord simple
function SimpleEmbedGuild(text)
{
    return new Embed()
    .setColor('#03adfc')
    .setDescription(text)
}

//customEmbed it already have EmbedBuilder Just add option text color and button...
function customEmbed(){
    return new EmbedBuilder()
}

//add button in embed
function oneButton(allButton){
    return new ActionRowBuilder().addComponents(allButton);
}
function twoButton(one, two){
    return new ActionRowBuilder().addComponents(one, two);
}
function threeButton(one, two, three){
    return new ActionRowBuilder().addComponents(one, two, three);
}
function fourButton(one, two, three, four){
    return new ActionRowBuilder().addComponents(one, two, three, four);
}
function fiveButton(one, two, three, four, five){
    return new ActionRowBuilder().addComponents(one, two, three, four, five);
}

//cooldown to use commands
function cooldown(id, timeout, cdId, cooldowntime, message, cooldowns, prem) {
    if (id == process.env.devId) {
        return false;
    }

    if (timeout.includes(id)) {
        if (cdId.includes(id)) { 
            return true; 
        }
        
        cdId.push(id); 

        if (prem.includes(id)) {
            const CD = parseInt(cooldowntime / 2);

            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + CD);
            if (currentTime < cooldownEnd) {
                const timeLeft = Math.ceil((cooldownEnd - currentTime) / 1000) - 1;
                message.channel.send({ embeds: [SimpleEmbed(`<@${id}> cooldown **<t:${Math.floor(cooldownEnd.getTime() / 1000)}:R>**`)] })
                    .then(cooldownMessage => {
                        setTimeout(() => {
                            cooldownMessage.delete().catch(console.error);
                            cdId.shift(); 
                        }, timeLeft * 1000); 
                    })
                    .catch(console.error);
                return true;
            }
            return true;
        }

        const cooldownEnd = cooldowns.get(message.guild.id);
        const currentTime = new Date();
        if (currentTime < cooldownEnd) {
            const timeLeft = Math.ceil((cooldownEnd - currentTime) / 1000) - 1;
            message.channel.send({ embeds: [SimpleEmbed(`<@${id}> cooldown **<t:${Math.floor(cooldownEnd.getTime() / 1000)}:R>**`)] })
                .then(cooldownMessage => {
                    setTimeout(() => {
                        cooldownMessage.delete().catch(console.error);
                        cdId.shift(); 
                    }, timeLeft * 1000); 
                })
                .catch(console.error);
            return true;
        }
        return true;

    } else {
        if(prem.includes(id)){
            const CD = parseInt(cooldowntime / 2);

            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + CD);
            cooldowns.set(message.guild.id, cooldownEnd);
            timeout.push(id);
            setTimeout(() => {
                timeout.shift();
                cdId.shift(); 
            }, CD - 1000);
            return false;

        }else{
            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + cooldowntime);
            cooldowns.set(message.guild.id, cooldownEnd);
            timeout.push(id);
            setTimeout(() => {
                timeout.shift();
                cdId.shift(); 
            }, cooldowntime - 1000);
            return false;
        }
    }
}

exports.grab = async function(p, ptype, ftype, text, notsfw, retry) {
    ftype = ftype.toLowerCase();
    ptype = ptype.toLowerCase();
    let nsfwt = notsfw ? "only" : false;
    let retryt = typeof retry === "boolean" ? retry : true;

    try {
        const array = await sh.getRandom({ type: ptype, nsfw: nsfwt, filetype: ftype });
        if (!array) {
            throw new Error("No image found");
        }

        const embed = {
            color: 4886754,
            image: { url: array.url },
            author: {
                name: text,
                url: array.url,
                icon_url: p.msg.author.avatarURL
            }
        };

        p.send({ embed });

    } catch (err) {
        if (retryt && (ftype === "jpg" || ftype === "png")) {
            const newFtype = ftype === "jpg" ? "png" : "jpg";
            this.grab(p, ptype, newFtype, text, notsfw, false);
        } else {
            p.errorMsg(", I couldn't find that image type! :c\nType `owo help gif` for the list of types!", 3000);
        }
    }
};

exports.getTypes = async function(p) {
    try {
        const array = await sh.getTypes();
        let txt = "Available Image Types:\n";
        txt += array.map(type => `\`${type}\``).join(", ");
        txt += ", `nsfw`\n*Some types will not work on pic*";
        p.send(txt);
    } catch (err) {
        p.errorMsg("Failed to fetch image types.", 3000);
    }
};

async function updateUser(userId, updatedData) {
    // Assuming you're using a MongoDB-like database
    try {
        const user = await UserModel.findById(userId); // Replace UserModel with your actual model
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, updatedData); // Merge updated data with existing user data
        await user.save(); // Save the updated user
        return user;
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        throw error; // Rethrow error to handle it elsewhere
    }
}

const isInVoiceChannel = (interaction) => {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
       interaction.reply({
            content: 'You are not in a voice channel!',
            ephemeral: true,
       });
       return false;
    }

    if (
        interaction.guild.members.me.voice.channelId &&
        interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
    ) {
        interaction.reply({
            content: 'You are not in my voice channel!',
            ephemeral: true,
        });
        return false;
    }

    return true;
}

module.exports = { 
    isInVoiceChannel, 
    updateUser, 
    cooldown, 
    fiveButton, 
    fourButton, 
    threeButton, 
    twoButton, 
    oneButton, 
    customEmbed, 
    SimpleEmbedGuild, 
    SimpleEmbed,
    getUser,
    getFiles,
    sleep,
    getRandomInt,
    mileToSec,
    mileToMin,
    mileToHour,
    xpToRateXp,
    xpToLevel };
const { EmbedBuilder } = require('discord.js'); // Use EmbedBuilder for v14+
const sym = '``';
module.exports = {
    name: 'ping',
    description: 'Responds with "Pong!" in an embed',
    async execute(client, message, args) {
        try {

            let ms = parseInt(message.createdTimestamp - Date.now());

            // Create an embed for the ping response
            const embed = new EmbedBuilder()
                .setColor('#0099ff') // Set a color for the embed
                .setTitle('🏓 Ping!') // Set the title
                .setDescription(`${sym}${ms}ms${sym} Pong!`) // Set the description
                .setTimestamp() // Optional: Add a timestamp
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() }); // Footer with user info

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error responding to ping command:', error);
            message.channel.send('An error occurred while processing your request. Please try again later.');
        }
    },
};

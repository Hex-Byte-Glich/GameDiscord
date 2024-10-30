const { EmbedBuilder } = require('discord.js'); // Use EmbedBuilder in v14+

module.exports = {
    name: 'ping',
    description: 'Responds with "Pong!" in an embed',
    async execute(interaction) {
        try {
            // Create an embed for the ping response
            const embed = new EmbedBuilder() // Use EmbedBuilder instead of MessageEmbed
                .setColor('#0099ff') // Set a color for the embed
                .setTitle('🏓 Ping!') // Set the title
                .setDescription('Pong!') // Set the description
                .setTimestamp() // Optional: Add a timestamp
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() }); // Footer with user info

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error responding to ping command:', error);
            await interaction.reply('An error occurred while processing your request. Please try again later.');
        }
    },
};

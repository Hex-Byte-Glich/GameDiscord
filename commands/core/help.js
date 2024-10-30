const { getUser } = require('../../Functions/function');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Displays a list of commands',
    async execute(client, message, args) {
        try {
            // Correct the typo: 'messase' should be 'message'
            const user = message.author;  
            const userData = await getUser(user.id);

            // List of commands
            const commands = [
                { name: '!ping', description: 'Responds with "Pong!"' },
                { name: '!help', description: 'Displays this help message' },
                // Add more commands here as needed
            ];

            // Construct the help message
            const helpMessage = `
            **${user.username}'s Commands:**
            ${commands.map(cmd => `- **${cmd.name}**: ${cmd.description}`).join('\n')}
            `;

            await message.channel.send(helpMessage);
        } catch (error) {
            console.error('Error fetching user data:', error);
            message.channel.send('An error occurred while fetching the help information. Please try again later.');
        }
    },
};

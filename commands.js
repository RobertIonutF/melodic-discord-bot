const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const commands = [
    {
        name: 'play',
        description: 'Play a song',
        options: [
            {
                name: 'song',
                type: 3,
                description: 'The URL of the song to play',
                required: true,
            },
        ],
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

/**
 * Registers the commands for a Discord bot application.
 * @param {string} clientId - The ID of the Discord bot application.
 * @param {string} guildId - The ID of the guild where the commands will be registered.
 * @returns {Promise<void>} - A promise that resolves when the commands are successfully registered.
 */
const registerCommands = async (clientId, guildId) => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};

module.exports = { registerCommands };  
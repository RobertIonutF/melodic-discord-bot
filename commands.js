// commands.js
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
    },
    {
        name: 'pause',
        description: 'Pause the song',
    },
    {
        name: 'stop',
        description: 'Stop the song',
    },
    {
        name: 'skip',
        description: 'Skip the song',
    },
    {
        name: 'queue',
        description: 'Show the queue',
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

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
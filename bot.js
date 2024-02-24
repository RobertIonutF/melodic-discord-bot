const { Client, GatewayIntentBits} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core'); 
const { registerCommands } = require('./commands');
require('dotenv').config();


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const queues = new Map(); // Guild ID mapped to its queue (array of song objects)

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(process.env.CLIENT_ID, process.env.GUILD_ID).then(() => {
        console.log('Commands registered');
    }).catch(console.error);
});

async function playSong(guildId) {
    const queue = queues.get(guildId);
    if (!queue || queue.length === 0) {
        getVoiceConnection(guildId)?.disconnect(); // Disconnect if the queue is empty
        queues.delete(guildId);
        return;
    }

    const song = queue[0]; // Get the first song in the queue

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    player.play(resource);

    const connection = joinVoiceChannel({
        channelId: song.voiceChannel.id,
        guildId: guildId,
        adapterCreator: song.voiceChannel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        queue.shift(); // Remove the played song
        playSong(guildId); // Play the next song
    }).on('error', error => {
        console.error(error);
        queue.shift(); // Attempt to skip the problematic song
        playSong(guildId); // Play the next song
    });

    queues.get(guildId)[0].textChannel.send(`Now playing: ${song.title}`);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'play') {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to play music!');
        }

        const songUrl = interaction.options.getString('song');

        const song = {
            url: songUrl,
            title: songUrl, 
            voiceChannel: interaction.member.voice.channel,
            textChannel: interaction.channel,
        };

        if (!queues.has(interaction.guildId)) {
            queues.set(interaction.guildId, [song]);
        } else {
            queues.get(interaction.guildId).push(song);
        }

        interaction.reply(`🎶 Adding to queue: ${songUrl}`);
        if (queues.get(interaction.guildId).length === 1) {
            playSong(interaction.guildId);
        }
    }
    
    if (interaction.commandName === 'pause') {
        const connection = getVoiceConnection(interaction.guildId);
        if (connection) {
            connection.audioPlayer.pause();
        }
    }

    if (interaction.commandName === 'stop') {
        const connection = getVoiceConnection(interaction.guildId);
        if (connection) {
            connection.destroy();
        }
    }

    if (interaction.commandName === 'skip') {
        const connection = getVoiceConnection(interaction.guildId);
        if (connection) {
            connection.audioPlayer.stop();
        }
    }

    if (interaction.commandName === 'queue') {
        const queue = queues.get(interaction.guildId);
        if (!queue || queue.length === 0) {
            return interaction.reply('The queue is empty!');
        }
        const queueList = queue.map((song, index) => `${index + 1}. ${song.title}`).join('\n');
        interaction.reply(`Queue:\n${queueList}`);
    }

    if (interaction.commandName === 'leave') {
        const connection = getVoiceConnection(interaction.guildId);
        if (connection) {
            connection.destroy();
        }
    }
});

client.login(process.env.BOT_TOKEN);
/**
 * @file Melodic Discord Bot
 * @description A Discord bot for playing music in voice channels.
 */
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

const queues = new Map(); 

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(process.env.CLIENT_ID, process.env.GUILD_ID).then(() => {
        console.log('Commands registered');
    }).catch(console.error);
});

/**
 * Plays a song in the specified guild.
 * @param {string} guildId - The ID of the guild.
 * @returns {void}
 */
async function playSong(guildId) {
    const queue = queues.get(guildId);
    if (!queue || queue.length === 0) {
        const voiceConnection = getVoiceConnection(guildId);
        if (voiceConnection) {
            const textChannel = queue?.[0]?.textChannel;
            if (textChannel) {
                await textChannel.send("🎶 No more to play, leaving the channel...");
            }
            voiceConnection.disconnect(); 
        }
        queues.delete(guildId);
        return;
    }

    const song = queue[0]; 

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
        queue.shift(); 
        playSong(guildId); 
    }).on('error', error => {
        console.error(error);
        queue.shift(); 
        playSong(guildId); 
    });

    queues.get(guildId)[0].textChannel.send(`🎶 Now playing: ${song.title}`);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'play') {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to play music!');
        }

        const songUrl = interaction.options.getString('song');

        if (!ytdl.validateURL(songUrl)) {
            return interaction.reply('The URL you provided is not a valid YouTube link!');
        }

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

    if (interaction.commandName === 'skip') {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to skip music!');
        }

        const queue = queues.get(interaction.guildId);
        if (!queue || queue.length === 0) {
            return interaction.reply('There is no song to skip!');
        }

        queue.shift();
        playSong(interaction.guildId);
        interaction.reply('🎶 Skipping song...');
    }

    if (interaction.commandName === 'queue') {
        const queue = queues.get(interaction.guildId);
        if (!queue || queue.length === 0) {
            return interaction.reply('There are no songs in the queue!');
        }
        
        //say the current song and the next songs in the queue
        let reply = '🎶 Current queue:\n';

        reply += `1. ${queue[0].title} (Now playing)\n`;

        reply += 'Up next:\n';
        for (let i = 1; i < queue.length; i++) {
            reply += `${i + 1}. ${queue[i].title}\n`;
        }

        interaction.reply(reply);
    }

    if (interaction.commandName === 'stop') {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to stop music!');
        }

        const queue = queues.get(interaction.guildId);
        if (!queue || queue.length === 0) {
            return interaction.reply('There is no song to stop!');
        }

        queue.length = 0; 
        getVoiceConnection(interaction.guildId)?.disconnect();
        queues.delete(interaction.guildId);
        interaction.reply('🎶 Stopping music...');
    }

    if (interaction.commandName === 'help') {
        interaction.reply('🎶 Commands:\n/play: Play a song\n/skip: Skip the current song\n/queue: View the current queue\n/stop: Clears queue, stops music and leave the channel.\n/help: Help command\n/health: Health command');
    }
});

client.login(process.env.BOT_TOKEN);
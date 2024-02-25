
# Melodic Discord Bot

This project consists of a Discord bot designed to play music in voice channels. It uses the Discord.js library along with several other packages to connect to Discord, join voice channels, and stream music.

## Features

- Connect to Discord using bot tokens.
- Join voice channels and play music using URLs provided by users.
- Queue management for playing multiple songs.
- Use of Discord.js and Discord API for interactions.

## Setup

1. Ensure you have Node.js installed on your system.
2. Clone this repository to your local machine.
3. Install the dependencies by running `npm install` in the project directory.
4. Create a `.env` file in the root directory and add your Discord bot token as `BOT_TOKEN=your_token_here`.
5. Download and install FFmpeg from [FFmpeg.org](https://ffmpeg.org). Make sure to add FFmpeg to your system's PATH environment variable to allow the bot to use it.
6. Run the bot using `npm start`.

## Dependencies

- `discord.js`: For interacting with the Discord API.
- `@discordjs/voice`: For handling voice connections in Discord.
- `ytdl-core`: For downloading and streaming YouTube videos as audio.
- `dotenv`: For managing environment variables.
- `FFmpeg`: Required for processing audio streams. Ensure it's installed and added to your system's PATH.

## Commands

Currently, the bot supports the following command:

- `/play`: Plays a song from a given URL in the user's current voice channel.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the ISC license.

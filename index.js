// Create a Discord Bot using OpenAI API that interacts on the Discord Server
require('dotenv').config();


const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    Events,
    REST,
    Routes
} = require('discord.js');


const {
    Configuration,
    OpenAIApi,
} = require('openai');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const rest = new REST({
    version: '10'
}).setToken(process.env.DISCORD_TOKEN);



async function main() {

    const commands = [{
        name: 'ask',
        description: 'Ask chatter something',
        options: [{
            name: 'prompt',
            description: 'What do you want to ask?',
            type: 3,
            required: true,
        }]
    }];

    try {
        console.log('Registering slash commands..')

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
                body: commands
            }
        )
        client.login(process.env.DISCORD_TOKEN)

        console.log('Commands registered successfully!')
    } catch (err) {
        console.log('There was an error:' + err)
    }

    client.once(Events.ClientReady, c => {
        console.log(`Logged in as ${c.user.tag}`)


    })
};


const configuration = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_KEY
})

const openai = new OpenAIApi(configuration);

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    //console.log(interaction.options.get('prompt').value)
    if (interaction.commandName == 'ask') {
        //await interaction.reply('TEST1');
        if (interaction.user.bot) {
            return;
        }

        await interaction.deferReply();

        try {
            const gptResponse = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: `ChatGPT is a friendly assistant. \n\
                ChatGPT: Hello, how are you? \n\
                User: ${interaction.options.get('prompt').value}\n\
                ChatGPT: `,
                temperature: 0.6,
                max_tokens: 200,
                stop: ["ChatGPT: "]
            })

            await interaction.editReply("\n** Question: **"+ interaction.options.get('prompt').value +"\n" + "```\n"+ gptResponse.data.choices[0].text + "\n```");

            return;
            //interaction.reply('HELLO');

        } catch (err) {
            console.log(err)
        }

    }
})

main();
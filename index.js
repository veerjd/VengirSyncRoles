/* eslint-disable no-console */
require('dotenv').config();
const { Client, Collection } = require('discord.js');
const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const fs = require('fs')
const prefix = process.env.PREFIX
const { doesMemberHaveVengirOnMain, ifVengirOnMain, ifNotVengirOnMain, addAndRemoveRoles } = require('./util/vengir')
const { advisorPing, buildEmbed, transferMessage } = require('./util/util')

let vengirServer
let mainServer
let vengirVengir
let vengirNotVengir
let mainVengir
let vengirLogsChannel
let crawServer
let advisors

// bot.commands as a collection(Map) of commands from ./commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
bot.commands = new Collection()
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  bot.commands.set(command.name, command)
}

// --------------------------------------
//       EVENT ON LOGIN
// --------------------------------------
bot.once('ready', () => {
  // vengirServer = bot.guilds.cache.get('717820602844577943') // Vengir Server
  // mainServer = bot.guilds.cache.get('283436219780825088') // Polytopia Server
  // crawServer = bot.guilds.cache.get('492753802450173987') // Crawfish Server
  crawServer = bot.guilds.cache.get('581872879386492929') // PolyCalculator Server

  vengirVengir = vengirServer.roles.cache.get('717825983209799741') // Swordsman
  vengirNotVengir = vengirServer.roles.cache.get('717826077048700930') // Swordless Swine
  mainVengir = mainServer.roles.cache.get('403739147036262402') // Vengir
  vengirLogsChannel = vengirServer.channels.cache.get('718205075490603118') // #jd
  advisors = crawServer.roles.cache.get('780148610390163486') // Craw's pingable advisor role

  console.log(`Logged in as ${bot.user.username}`);
});

// --------------------------------------
//
//      EVENT ON MESSAGE
//
// --------------------------------------
bot.on('message', async message => {
  if (message.author.bot)
    return

  const continuing = await advisorPing(message, crawServer, advisors)
  if (!continuing)
    return

  if (crawServer.id !== message.guild.id)
    return

  if (!message.content.startsWith(prefix) || message.content === prefix || message.channel.type === 'dm')
    return

  const textStr = message.cleanContent.slice(prefix.length)
  const commandName = textStr.split(/ +/).shift().toLowerCase();
  const argsStr = textStr.slice(commandName.length + 1)

  // Map all the commands
  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  // Return if the command doesn't exist
  if (!command)
    return

  const replyData = {
    content: [],
    deleteContent: false,
    title: undefined,
    description: undefined,
    fields: [],
    footer: undefined
  }

  // Check if the user has the permissions necessary to execute the command
  if (!(command.permsAllowed !== 'VIEW_CHANNEL' || command.permsAllowed.some(x => message.member.hasPermission(x)) || command.usersAllowed.some(x => x === message.author.id)))
    return message.channel.send('Only an admin can use this command, sorry!')

  try {
    // EXECUTE COMMAND
    const replyObj = await command.execute(message, argsStr, replyData)

    replyObj.content.forEach(async other => {
      if (typeof other[0] === 'object')
        other[0] = buildEmbed(other[0])
      const warnings = await message.channel.send(other[0], other[1])
      if (replyObj.deleteContent)
        warnings.delete({ timeout: 15000 })
    })

    if (replyObj.description === undefined && replyObj.title === undefined && replyObj.fields.length === 0)
      return

    const msg = buildEmbed(replyObj)

    message.channel.send(msg)
      .catch(console.error)

    return
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)

    return message.channel.send(`${error}`)
      .catch(console.error)
  }
})

bot.on('messageUpdate', (oldMessage, newMessage) => {
  transferMessage(newMessage, crawServer)
})

// ---------------------------------------
//  EVENT WHEN A NEW MEMBER JOINS VENGIR
// ---------------------------------------
bot.on('guildMemberAdd', newMember => {
  if (newMember.guild.id !== '717820602844577943')
    return

  const mainMember = mainServer.member(newMember.user.id)

  if (!mainMember)// || mainMember.user.id !== '217385992837922819') // If the Vengir member isn't in Main
    return vengirLogsChannel.send(`**${newMember.user.username}** isn't in Main Polytopia :astonished:`)


  console.log(newMember.user.username)
  let arrayOfChanges = []

  if (doesMemberHaveVengirOnMain(mainMember, mainVengir)) {
    arrayOfChanges = ifVengirOnMain(newMember, vengirVengir, vengirNotVengir)
    vengirLogsChannel.send(`**${newMember.user.username}** joined the rebel forces and was knighted kind folk!`)
  } else {
    arrayOfChanges = ifNotVengirOnMain(newMember, vengirVengir, vengirNotVengir)
    vengirLogsChannel.send(`**${newMember.user.username}** was disgraced by leaving our fierce and beloved tribe, slash him.`)
  }

  addAndRemoveRoles(newMember, arrayOfChanges[0], arrayOfChanges[1], vengirVengir, vengirNotVengir, vengirLogsChannel)
})

// ---------------------------------------
//  EVENT WHEN ROLES ARE CHANGED IN MAIN
// ---------------------------------------
bot.on('guildMemberUpdate', (oldMainMember, newMainMember) => {

  if (oldMainMember.guild !== mainServer) // If the event didn't happen on Main
    return

  if (oldMainMember.roles.cache === newMainMember.roles.cache) // If the event didn't change the roles
    return;

  if (!oldMainMember.roles.cache.has(mainVengir.id) && !newMainMember.roles.cache.has(mainVengir.id)) // If neither the oldMainMember nor the newMainMember have the Vengir role
    return

  const vengirMember = vengirServer.member(newMainMember.user.id)

  if (!vengirMember) // If the Main member isn't in Vengir
    return

  if (doesMemberHaveVengirOnMain(oldMainMember, mainVengir) && doesMemberHaveVengirOnMain(newMainMember, mainVengir)) // If both newMainMember and oldMainMember have Vengir on Main (ie no changes to Vengir role)
    return

  if (!doesMemberHaveVengirOnMain(oldMainMember, mainVengir) && !doesMemberHaveVengirOnMain(newMainMember, mainVengir)) // If both newMainMember and oldMainMember don't have Vengir on Main (ie no changes to Vengir role)
    return

  let arrayOfChanges = []
  if (doesMemberHaveVengirOnMain(newMainMember, mainVengir))
    arrayOfChanges = ifVengirOnMain(vengirMember, vengirVengir, vengirNotVengir)
  else
    arrayOfChanges = ifNotVengirOnMain(vengirMember, vengirVengir, vengirNotVengir)

  addAndRemoveRoles(vengirMember, arrayOfChanges[0], arrayOfChanges[1], vengirVengir, vengirNotVengir, vengirLogsChannel)
});

process.on('unhandledRejection', (code) => {

  console.log(`unhandledRejection: ${code}`)
})

bot.login(process.env.TOKEN);
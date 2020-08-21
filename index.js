/* eslint-disable no-console */
require('dotenv').config();
const { Client } = require('discord.js');
const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const { doesMemberHaveVengirOnMain, ifVengirOnMain, ifNotVengirOnMain, addAndRemoveRoles } = require('./util')

let vengirServer
let mainServer
let vengirVengir
let vengirNotVengir
let mainVengir
let vengirLogsChannel

// --------------------------------------
//       EVENT ON LOGIN
// --------------------------------------
bot.once('ready', () => {
  vengirServer = bot.guilds.cache.get('717820602844577943') // Vengir Server
  mainServer = bot.guilds.cache.get('283436219780825088') // Polytopia Server
  vengirVengir = vengirServer.roles.cache.get('717825983209799741') // Swordsman
  vengirNotVengir = vengirServer.roles.cache.get('717826077048700930') // Swordless Swine
  mainVengir = mainServer.roles.cache.get('403739147036262402') // Vengir
  vengirLogsChannel = vengirServer.channels.cache.get('718205075490603118') // #jd

  console.log(`Logged in as ${bot.user.username}`);
});

// ---------------------------------------
//  EVENT WHEN A NEW MEMBER JOINS VENGIR
// ---------------------------------------
bot.on('guildMemberAdd', newMember => {
  if(newMember.guild.id !== '717820602844577943')
    return

  const mainMember = mainServer.member(newMember.user.id)

  if(!mainMember)// || mainMember.user.id !== '217385992837922819') // If the Vengir member isn't in Main
    return vengirLogsChannel.send(`**${newMember.user.username}** isn't in Main Polytopia :astonished:`)


  console.log(newMember.user.username)
  let arrayOfChanges = []

  if(doesMemberHaveVengirOnMain(mainMember, mainVengir)) {
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

  if(oldMainMember.guild !== mainServer) // If the event didn't happen on Main
    return

  if(oldMainMember.roles.cache === newMainMember.roles.cache) // If the event didn't change the roles
    return;

  if(!oldMainMember.roles.cache.has(mainVengir.id) && !newMainMember.roles.cache.has(mainVengir.id)) // If neither the oldMainMember nor the newMainMember have the Vengir role
    return

  const vengirMember = vengirServer.member(newMainMember.user.id)

  if(!vengirMember) // If the Main member isn't in Vengir
    return

  if(doesMemberHaveVengirOnMain(oldMainMember, mainVengir) && doesMemberHaveVengirOnMain(newMainMember, mainVengir)) // If both newMainMember and oldMainMember have Vengir on Main (ie no changes to Vengir role)
    return

  if(!doesMemberHaveVengirOnMain(oldMainMember, mainVengir) && !doesMemberHaveVengirOnMain(newMainMember, mainVengir)) // If both newMainMember and oldMainMember don't have Vengir on Main (ie no changes to Vengir role)
    return

  let arrayOfChanges = []
  if(doesMemberHaveVengirOnMain(newMainMember, mainVengir))
    arrayOfChanges = ifVengirOnMain(vengirMember, vengirVengir, vengirNotVengir)
  else
    arrayOfChanges = ifNotVengirOnMain(vengirMember, vengirVengir, vengirNotVengir)

  addAndRemoveRoles(vengirMember, arrayOfChanges[0], arrayOfChanges[1], vengirVengir, vengirNotVengir, vengirLogsChannel)
});

process.on('unhandledRejection', (code) => {

  console.log(`unhandledRejection: ${code}`)
})

bot.login(process.env.TOKEN);
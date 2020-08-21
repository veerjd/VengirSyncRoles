/* eslint-disable no-console */
require('dotenv').config();
const { Client } = require('discord.js');
const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const { doesMemberHaveVengirOnMain, ifVengirOnMain, ifNotVengirOnMain, addAndRemoveRoles } = require('./util')

// --------------------------------------
//
//       EVENT ON LOGIN
//
// --------------------------------------
bot.once('ready', () => {
  // eslint-disable-next-line no-console
  console.log(`Logged in as ${bot.user.username}`);

  const vengirServer = bot.guilds.cache.get('717820602844577943') // Vengir Server
  const mainServer = bot.guilds.cache.get('283436219780825088') // Polytopia Server

  const vengirVengir = vengirServer.roles.cache.get('717825983209799741') // Swordsman
  const vengirNotVengir = vengirServer.roles.cache.get('717826077048700930') // Swordless Swine
  const mainVengir = mainServer.roles.cache.get('403739147036262402') // Vengir

  const vengirLogsChannel = vengirServer.channels.cache.get('745059977651290162') // #jd

  vengirServer.members.cache.forEach(vengirMember => {
    const mainMember = mainServer.member(vengirMember.user.id)

    if(!mainMember)// || mainMember.user.id !== '217385992837922819') // If the Vengir member isn't in Main
      return vengirLogsChannel.send(`**${vengirMember.user.username}** isn't in Main Polytopia :astonished:`)

    console.log(vengirMember.user.username)
    let arrayOfChanges = []
    if(doesMemberHaveVengirOnMain(mainMember, mainVengir)) {
      arrayOfChanges = ifVengirOnMain(vengirMember, vengirVengir, vengirNotVengir)
      vengirLogsChannel.send(`**${vengirMember.user.username}** joined the rebel forces and was knighted kind folk!`)
    } else {
      arrayOfChanges = ifNotVengirOnMain(vengirMember, vengirVengir, vengirNotVengir)
      vengirLogsChannel.send(`**${vengirMember.user.username}** was disgraced by leaving our fierce and beloved tribe, slash him.`)
    }

    addAndRemoveRoles(vengirMember, arrayOfChanges[0], arrayOfChanges[1])
    /*
    if(mainMember.roles.cache.has(mainVengir.id)) { // If he has Vengir role on Main
      if(!vengirMember.roles.cache.has(vengirVengir.id)) // If he doesn't have Vengir role on Vengir, should be added
        vengirMember.roles.add(vengirVengir)
          .then(() => {
            console.log(mainMember.user.username, 'true')
            vengirLogsChannel.send(`**${vengirMember.user.username}** joined the rebel forces and was knighted kind folk!`)
          })
          .catch(err => {
            vengirLogsChannel.send(`ERROR: ${err}`)
              .then().catch(err => {vengirLogsChannel.send(`ERROR: ${err}`)})
          })
      if(vengirMember.roles.cache.has(vengirNotVengir.id)) // If he has non-Vengir role on Vengir, should be removed
        vengirMember.roles.remove(vengirNotVengir)
          .then(() => {}).catch(err => {
            vengirLogsChannel.send(`ERROR: ${err}`)
              .then().catch(err => {vengirLogsChannel.send(`ERROR: ${err}`)})
          })
    } else { // If he DOESN'T have Vengir on Main
      if(vengirMember.roles.cache.has(vengirNotVengir.id))
        return

      vengirMember.roles.add(vengirNotVengir)
        .then(() => {
          console.log(mainMember.user.username, 'false')
          vengirLogsChannel.send(`**${vengirMember.user.username}** was disgraced by leaving our fierce and beloved tribe, slash him.`)
        })
        .catch(err => {
          vengirLogsChannel.send(`ERROR: ${err}`)
            .then().catch(err => {vengirLogsChannel.send(`ERROR: ${err}`)})
        })

      if(!vengirMember.roles.cache.has(vengirVengir.id))
        return

      vengirMember.roles.remove(vengirVengir)
        .then(() => {
          console.log(mainMember.user.username, 'false')
          vengirLogsChannel.send(`**${vengirMember.user.username}** was disgraced by leaving our fierce and beloved tribe, slash him.`)
        })
        .catch(err => {
          vengirLogsChannel.send(`ERROR: ${err}`)
            .then().catch(err => {vengirLogsChannel.send(`ERROR: ${err}`)})
        })
    }*/
  })
});

process.on('unhandledRejection', (code) => {
  // eslint-disable-next-line no-console
  console.log(`unhandledRejection: ${code}\n${code.stack}`)
})

bot.login(process.env.TOKEN);
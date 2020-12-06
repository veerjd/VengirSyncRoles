const advisorCommand = require('../commands/advisors')
const { MessageEmbed } = require('discord.js')

module.exports.buildEmbed = function (data) {
  const embed = new MessageEmbed().setColor('#277ecd')
  if (data.title)
    embed.setTitle(data.title)
  if (data.description)
    embed.setDescription(data.description)
  if (data.fields)
    data.fields.forEach(el => {
      embed.addField(el.name, el.value.join('\n'))
    })

  return embed
}

module.exports.saveStats = function (data, db) {
  const sql = 'INSERT INTO stats (content, author_id, author_tag, command, attacker, defender, url, message_id, server_id, will_delete, attacker_description, defender_description, reply_fields, arg) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)'
  const values = [data.content, data.author_id, data.author_tag, data.command, data.attacker, data.defender, data.url, data.message_id, data.server_id, data.will_delete, data.attacker_description, data.defender_description, data.reply_fields, data.arg]
  db.query(sql, values)
}

module.exports.logUse = function (message, logChannel) {
  let content
  if (message.cleanContent.length > 256)
    content = message.cleanContent.slice(0, 255)
  else
    content = message.cleanContent

  const logData = {
    title: `**${content}**`,
    description: ` in **${message.guild.name.toUpperCase()}**\nin ${message.channel} (#${message.channel.name})\nby ${message.author} (${message.author.tag})\n${message.url}`
  }
  const newEmbed = module.exports.buildEmbed(logData)
  logChannel.send(newEmbed)
}

module.exports.milestoneMsg = async function (message, db, newsChannel, meee) {
  let { rows } = await db.query('SELECT COUNT(st.id) AS "triggers" FROM stats st JOIN servers se ON se.server_id = st.server_id')

  rows = rows[0]
  rows.triggers = parseInt(rows.triggers)

  if (rows.triggers % 50000 === 0) {
    newsChannel.send(`<:yay:585534167274618997>:tada: Thanks to ${message.author} (${message.author.username}), we reached ${rows.triggers} uses! :tada:<:yay:585534167274618997>`)
    meee.send(`<:yay:585534167274618997>:tada: Thanks to ${message.author} (${message.author.username}), we reached **${rows.triggers}** uses! :tada:<:yay:585534167274618997>`)
  }
}

module.exports.advisorPing = async function (message, crawServer, advisors) {
  const replyData = {
    content: [],
    title: undefined,
    description: undefined,
    fields: [],
    deleteContent: false,
    footer: undefined
  }
  // advisors = { id: '654164915032031252' }
  if (message.mentions.roles.get(advisors.id)) {
    const reply = await advisorCommand.execute(message, message.cleanContent, replyData)
    if (reply) {
      reply.content.forEach(async other => {
        const warnings = await message.channel.send(other[0], other[1])
        if (reply.deleteContent)
          warnings.delete({ timeout: 15000 })
      })
      return false
    }
  } else {
    return module.exports.transferMessage(message, crawServer)
  }
}

module.exports.transferMessage = function (message, crawServer) {
  if (!crawServer)
    return false

  const channelA = crawServer.channels.cache.get(crawAnnouncements)

  if (announcementChannels.some(x => x === message.channel.id)) {
    channelA.send(`**${message.guild.name} #${message.channel.name}**\n\`\`\`${message.createdAt.toUTCString()}\`\`\`\n${message.cleanContent}`, { files: message.attachments.array(), disableMentions: 'none' })
    return false
  } else if (message.id === pickFatCount) {
    channelA.send(`**${message.guild.name} #${message.channel.name}**\n\`\`\`${message.editedAt.toUTCString()}\`\`\`\n${message.cleanContent}`)
    return false
  } else
    return true
}

const crawAnnouncements = '747198636495994910'

const announcementChannels = [
  '447986488152686594', // server-announcements
  '488572469666512896', // league-updates
  '722958026885169163', // league-stats
  '688810283900469279', // draft-selection
  '689873462118187017' // free-agent-picks
]

const pickFatCount = '714204768289030214'
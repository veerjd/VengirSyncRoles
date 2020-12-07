const db = require('../db')

module.exports = {
  name: 'alladvisors',
  description: 'Get a list of all advisors for each game (no user pings)!',
  aliases: ['all'],
  shortUsage(prefix) {
    return `${prefix}alladvisors`
  },
  longUsage(prefix) {
    return `${prefix}all`
  },
  forceNoDelete: true,
  category: 'Staff',
  permsAllowed: ['MANAGE_MESSAGES'],
  usersAllowed: ['217385992837922819'],
  execute: async function (message, argsStr, replyData) {
    const sql = 'SELECT * FROM advisors'
    const { rows } = await db.query(sql)

    if (!rows[0]) {
      const actualAdvisors = message.guild.roles.cache.get(process.env.FULLADVISOR) // @People giving advice
      // replyData.content.push([argsStr, {}])
      replyData.content.push([actualAdvisors, {}])
      return replyData
    }

    const pings = []
    rows.forEach(dbChannel => {
      const members = []
      if (dbChannel.advisors)
        dbChannel.advisors.forEach(advisor => {
          const member = message.guild.members.cache.get(advisor)
          members.push(member.user.username)
        })

      const channel = message.client.channels.cache.get(dbChannel.channel_id)
      if (members.length > 0)
        pings.push(`${channel}:\n${members.join(', ')}`)
    })

    // replyData.content.push([argsStr, {}])
    replyData.content.push([pings.join('\n'), {}])
    return replyData
  }
};
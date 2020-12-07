const db = require('../db')

module.exports = {
  name: 'advisors',
  description: 'Ping game-specific advisors for Crawfish server!',
  aliases: ['advisor', 'ad'],
  shortUsage(prefix) {
    return `${prefix}pingadvisors`
  },
  longUsage(prefix) {
    return `${prefix}ad`
  },
  forceNoDelete: true,
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819'],
  execute: async function (message, argsStr, replyData) {
    if (argsStr.length < 1)
      throw 'You need to specify a message'

    const sql = 'SELECT * FROM advisors WHERE channel_id = $1'
    const values = [message.channel.id]
    const { rows } = await db.query(sql, values)

    if (!rows[0]) {
      const actualAdvisors = message.guild.roles.cache.get(process.env.FULLADVISOR) // @People giving advice
      replyData.content.push([argsStr + '\n<@&' + actualAdvisors.id + '>', {}])
      return replyData
    }

    const advisors = rows[0].advisors

    const pings = []
    advisors.forEach(x => {
      const member = message.guild.members.cache.get(x)
      pings.push(member.user.id)
    })

    replyData.content.push([argsStr, {}])
    replyData.content.push(['<@' + pings.join('>, <@') + '>', {}])
    return replyData
  }
};
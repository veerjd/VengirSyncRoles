module.exports = {
  name: 'help',
  description: 'display all the commands\' details.',
  aliases: ['commands', 'command', 'h'],
  shortUsage(prefix) {
    return `${prefix}help {command}`
  },
  longUsage(prefix) {
    return `${prefix}h {command}`
  },
  forceNoDelete: false,
  category: 'hidden',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819'],
  execute: function (message, argsStr, replyData) {
    const { commands } = message.client;
    const argsArray = argsStr.split(/ +/)
    const command = commands.get(argsArray[0]) || commands.find(alias => alias.aliases && alias.aliases.includes(argsArray[0]))
    let doesntHavePerms

    if (command && command.permsAllowed)
      doesntHavePerms = !(command.permsAllowed.some(x => message.member.hasPermission(x)) || command.usersAllowed.some(x => x === message.author.id))

    if (doesntHavePerms)
      return replyData

    if (argsStr.length != 0 && !doesntHavePerms) {
      if (!command)
        throw `This command doesn't exist.\nGo get some \`${process.env.PREFIX}help\`!`

      replyData.title = `Help card for \`${process.env.PREFIX}${command.name}\``
      replyData.description = `**Description:** ${command.description}`
      replyData.fields.push({ name: '**Short usage:**', value: command.shortUsage(process.env.PREFIX) })
      replyData.fields.push({ name: '**Long usage:**', value: command.longUsage(process.env.PREFIX) })
      replyData.footer = `aliases: ${command.aliases.join(', ')}`

      return replyData
    } else {
      const categoriesMapped = {
        Basic: {},
        Staff: {}
      }

      const allowedCommands = commands.filter(x => x.permsAllowed.some(y => message.member.hasPermission(y)))
      allowedCommands.forEach(cmd => {
        if (cmd.category === 'hidden')
          return

        const category = categoriesMapped[cmd.category]

        category[cmd.name] = {
          name: cmd.name,
          description: cmd.description,
          aliases: cmd.aliases,
          shortUsage: cmd.shortUsage(process.env.PREFIX),
          longUsage: cmd.longUsage(process.env.PREFIX)
        }
      })

      replyData.title = ('Advisor-related commands')
      replyData.footer = (`For more help on a command: ${process.env.PREFIX}help {command}\nExample: ${process.env.PREFIX}help calc`)

      for (const [cat, commandsList] of Object.entries(categoriesMapped)) {
        const field = []
        for (const [name, details] of Object.entries(commandsList)) {
          field.push(`**${name}**: ${details.description}`)
        }
        if (field.length > 0)
          replyData.fields.push({ name: `**${cat}:**`, value: field })
      }

      return replyData
    }
  }
};
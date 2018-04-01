// declaring possible command types
const Fuse = require('fuse.js')

const TYPE_STRING = 'string'
const TYPE_REGEXP = 'regexp'
const TYPE_ARRAY = 'array'

// const makeStringLower = str => typeof str === 'string' ? str.toLowerCase() : str

class Commands {
  constructor(config = {}) {
    this.commands = []
    this.fuseOptions = {
      tokenize: true,
      treshold: config.fuzzyTreshold || 0.2,
      distance: config.fuzzyDistance || 10,
      keys: ['name']
    }
  }

  get() {
    return this.commands
  }

  get _strings() {
    return this.commands.filter(cmd => cmd.type !== TYPE_REGEXP)
  }
  get _regexps() {
    return this.commands.filter(cmd => cmd.type === TYPE_REGEXP)
  }

  _searchStrings(requestedCommandName) {
    const stringCommands = this._strings
    const fuse = new Fuse(stringCommands, this.fuseOptions)
    return fuse.search(requestedCommandName)
  }

  _searchRegexps(requestedCommandName) {
    const regexpCommands = this._regexps
    // @TODO: include matches and captured groups
    return regexpCommands.filter(reg => requestedCommandName.match(reg))
  }

  search(requestedCommandName) {
    const matchedStrings = this._searchStrings(requestedCommandName)
    const matchedRegexps = this._searchRegexps(requestedCommandName)
    if (matchedStrings.length > 0) {
      return matchedStrings
    } else if (matchedRegexps.length > 0) {
      return matchedRegexps
    } else {
      return []
    }
  }

  getByName(name) {
    if (!name) throw new Error('Name is not specified')
    return this.commands.find(command =>
      command.name.toLowerCase() === name.toLowerCase()
    )
  }

  get length() {
    return this.commands.length
  }

  add(name, callback) {
    let type

    if (typeof name === 'string') {
      type = TYPE_STRING
    } else if (name instanceof RegExp) {
      type = TYPE_REGEXP
    } else if (Array.isArray(name)) {
      type = TYPE_ARRAY
    } else {
      throw new Error(`Command name is not of proper type.
        Could be only string, array of strings or regular expression`)
    }

    this.commands.push({
      name: name,
      type: type,
      callback: callback
    })
  }
}

module.exports = Commands
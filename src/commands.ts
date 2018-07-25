import utils from './utils'
import Fuse from 'fuse.js'

import {
  TYPE_STRING,
  TYPE_ARRAY,
  TYPE_REGEXP,
  TYPE_FIGURE,
  TYPE_MATCHER,
} from './constants'
import { ICommands } from './types/commands'
import Command, { CommandName, CommandCallback } from './command'
import Context from './context'

export default class Commands implements ICommands {
  public commands: Command[]
  public fuseOptions: {}
  constructor(config = null) {
    this.commands = []
    this.fuseOptions = config || {
      tokenize: true,
      threshold: 0.1,
      distance: 10,
      keys: ['name'],
    }
  }

  public get() {
    return this.commands
  }

  get _matchers() {
    return this.commands.filter((command) => command.type === TYPE_MATCHER)
  }
  get _strings() {
    return this.commands.filter((command) =>
      [TYPE_STRING, TYPE_ARRAY].includes(command.type),
    )
  }

  get _figures() {
    return this.commands.filter((command) => command.type === TYPE_FIGURE)
  }
  get _regexps() {
    return this.commands.filter((command) => command.type === TYPE_REGEXP)
  }

  public async search(ctx: Context): Promise<Command[]> {
    const matchedStrings = this._searchStrings(ctx.message)
    const matchedRegexps = this._searchRegexps(ctx.message)
    const matchedFigures = this._searchFigures(ctx.message)
    const matchedMatchers = await this._searchMatchers(ctx)
    if (matchedMatchers.length > 0) {
      return matchedMatchers
    } else if (matchedStrings.length > 0) {
      return matchedStrings
    } else if (matchedRegexps.length > 0) {
      return matchedRegexps
    } else if (matchedFigures.length > 0) {
      return matchedFigures
    } else {
      return []
    }
  }

  get length() {
    return this.commands.length
  }

  public add(name: CommandName, callback: CommandCallback) {
    this.commands.push(new Command(name, callback))
  }

  public flush() {
    this.commands = []
  }

  private async _searchMatchers(ctx: Context) {
    const matchers = this._matchers
    for (const matcher of matchers) {
      const matchPredicate = matcher.name as (ctx: Context) => boolean;

      if (await matchPredicate(ctx)) {
        return [matcher]
      }
    }
    return []
  }

  private _searchStrings(requestedCommandName: string) {
    const stringCommands = this._strings
    const fuse = new Fuse(stringCommands, this.fuseOptions)
    return fuse.search<typeof stringCommands[0]>(requestedCommandName)
  }

  private _searchFigures(requestedCommandName: string) {
    const figuresCommands = this._figures
    return figuresCommands.filter((figure) => {
      const reg = utils.getFiguresRegexp(figure.name)
      return requestedCommandName.match(reg)
    })
  }

  private _searchRegexps(requestedCommandName) {
    const regexpCommands = this._regexps
    // @TODO: include matches and captured groups
    return regexpCommands.filter((reg) => requestedCommandName.match(reg.name))
  }
}

module.exports = Commands
module.exports.Command = Command

export { Command }

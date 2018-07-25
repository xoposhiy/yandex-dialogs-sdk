import Alice from './alice'
import Commands from './commands'
import { CommandCallback, CommandName, CommandReply } from './command'

import { IConfig } from './types/alice'
import Context from './context'

export default class Scene extends Alice {
  public name: string
  public enterCommand: Commands
  public leaveCommand: Commands
  protected commands: Commands
  protected config: IConfig
  protected anyCallback: CommandCallback

  constructor(name, config: IConfig = {}) {
    super()
    this.name = name
    this.anyCallback = null
    this.commands = new Commands(config.fuseOptions || null)
    this.config = config

    this.enterCommand = null
    this.leaveCommand = null
  }

  get title() {
    return this.name
  }

  public on(event) {
    /* enter, leave, etc */
  }

  /*
   * Trigger to activate the scene
   */
  public enter(name: CommandName, callback: CommandCallback) {
    if (!name) {
      throw new Error('Enter command name is not specified')
    }
    this.enterCommand = new Commands(this.config.fuseOptions || null)
    this.enterCommand.add(name, callback)
  }

  /*
   * Trigger to leave the scene
   */
  public leave(name: CommandName, callback: CommandCallback) {
    if (!name) {
      throw new Error('Leave command name is not specified')
    }

    this.leaveCommand = new Commands(this.config.fuseOptions || null)
    this.leaveCommand.add(name, callback)
  }

  public command(name: CommandName, callback: CommandCallback) {
    this.commands.add(name, callback)
  }

  public any(callback: CommandCallback) {
    this.anyCallback = callback
  }

  public async isEnterCommand(ctx) {
    if (!this.enterCommand) {
      return false
    }
    const matched = await this.enterCommand.search(ctx)
    return matched.length !== 0
  }

  public async isLeaveCommand(ctx) {
    if (!this.leaveCommand) {
      return false
    }
    const matched = await this.leaveCommand.search(ctx)
    return matched.length !== 0
  }

  public async handleSceneRequest(ctx: Context, type: string = null): Promise<void> {
    const [requestedCommand] = await this._getCommandsByType(ctx, type)
    let reply: void | CommandReply = null

    if (requestedCommand) {
      reply = await requestedCommand.callback(ctx)
    } else if (this.anyCallback) {
      reply = await this.anyCallback(ctx)
    }

    if (reply) {
      ctx.reply(reply)
    }
  }

  private async _getCommandsByType(ctx: Context, type: string) {
    if (type === 'enter') {
      return [this.enterCommand.get()[0]]
    }

    if (type === 'leave') {
      return [this.leaveCommand.get()[0]]
    }

    return await this.commands.search(ctx)
  }
}

module.exports = Scene

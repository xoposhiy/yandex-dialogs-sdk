import { isFunction } from './utils'
import { BigImageCard, ItemsListCard } from './types/card'
import Context from './context'

import { TYPE_STRING, TYPE_FIGURE, TYPE_REGEXP, TYPE_ARRAY, TYPE_MATCHER } from './constants'

export type CommandName = ((ctx: Context) => boolean) | any[] | string | RegExp
export type CommandCallback = (ctx: Context) => void | CommandReply
export type CommandReply = string | CommandReplyDesc
export type CommandType = 'string' | 'figure' | 'regexp' | 'array' | 'matcher'

export type CommandReplyDesc = {
    text?: string
    tts?: string
    endSession?: boolean
    buttons?: any[]
    card?: BigImageCard | ItemsListCard
  }
  

export default class Command {
  public name: CommandName
  public type: CommandType
  public callback: CommandCallback

  constructor(name: CommandName, callback: CommandCallback) {
    if (name === undefined) {
      throw new Error('Command name is not specified')
    }
    this.name = name
    this.callback = callback
    this.type = this._defineCommandType(this.name)

    return this
  }

  public _defineCommandType(name) {
    let type

    if (isFunction(name)) {
      type = TYPE_MATCHER
    } else if (typeof name === 'string') {
      type = TYPE_STRING
      if (name.includes('${')) {
        type = TYPE_FIGURE
      }
    } else if (name instanceof RegExp) {
      type = TYPE_REGEXP
    } else if (Array.isArray(name)) {
      type = TYPE_ARRAY
    } else {
      throw new Error(`Command name is not of proper type.
                Could be only string, array of strings, regular expression or function`)
    }
    return type
  }
}

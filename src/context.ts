import { compose } from 'ramda'
import { reversedInterpolation, selectCommand } from './utils'
import Session from './session'
import Scene from './scene'

import ReplyBuilder from './replyBuilder'
import ButtonBuilder from './buttonBuilder'

import { WebhookResponse, WebhookRequest } from './types/webhook'
import { EventEmitterInterface } from './types/eventEmitter'
import Command, { CommandReply } from './command'
import { BigImageCard } from './types/card'
import { image, bigImageCard } from './card'
import eventEmitter from './eventEmitter'

import { EVENT_MESSAGE_SENT } from './constants'

export default class Context {
  public req: WebhookRequest
  public sessionId: string
  public messageId: string
  public userId: string
  public payload: {}
  public message: string
  public session: Session
  public originalUtterance: string
  public eventEmitter: EventEmitterInterface

  public command?: Command

  public buttonBuilder: ButtonBuilder

  public sendResponse: (response: WebhookResponse) => void

  private _isReplied: boolean // forbids to send reply twice
  private scenes: Scene[]

  constructor(params) {
    const {
      req,
      sendResponse,
      session,
      scenes,

      command,
    } = params

    this.req = req
    this.scenes = scenes
    this.sendResponse = sendResponse

    this.sessionId = req.session.session_id
    this.messageId = req.session.message_id
    this.userId = req.session.user_id
    this.payload = req.request.payload
    this.message = req.request.command
    this.originalUtterance = req.request.original_utterance

    this.session = session

    this.eventEmitter = eventEmitter
    this.buttonBuilder = new ButtonBuilder()

    this._isReplied = false

    if (command) {
      this.command = command
    }
  }

  get body() {
    const requestText = selectCommand(this.req)

    if (this.command && typeof this.command.name === 'string') {
      return reversedInterpolation(this.command.name, requestText)
    }

    return null
  }

  public reply(replyMessage: CommandReply): void {
    if (typeof replyMessage === 'undefined') {
      throw new Error('Reply message could not be empty!')
    }

    const message = this._mapReplyToWebhookResponse(replyMessage)
    this._sendReply(message)
  }

  public async replyWithImage(params: string | BigImageCard) {
    const card = typeof params === 'string' ? compose(
      bigImageCard,
      image
    )(params) : bigImageCard(params)

    const message = this._mapReplyToWebhookResponse({ text: 'ᅠ ', card  })
    return this._sendReply(message)
  }

  public enterScene(scene: Scene): void {
    if (!scene) throw new Error('Please provide scene you want to enter in')
    if (this.scenes.includes(scene) === false) throw new Error('Сцена не зарегистрирована. Сначала вызовите alice.registerScene( scene ).')

    this.session.setData('currentScene', scene.name)
  }

  public leaveScene(): void {
    this.session.setData('currentScene', null)
  }

  public goodbye(replyMessage: CommandReply): void {
    if (typeof replyMessage === 'undefined') {
      throw new Error('Message should be string or result of ReplyBuilder.get')
    }

    const message = this._mapReplyToWebhookResponse(replyMessage)
    message.response.end_session = true;

    this._sendReply(message)
  }

  private _mapReplyToWebhookResponse(reply: CommandReply): WebhookResponse {
    const builder = new ReplyBuilder(this.req);

    if (typeof reply === 'string') {
      builder
        .text(reply)
        .tts(reply)
    } else {
      if (reply.text) {
        builder.text(reply.text)
      }

      if (reply.tts) {
        builder.tts(reply.tts)
      }

      if (reply.card) {
        builder.card(reply.card)
      }

      if (reply.buttons) {
        reply.buttons.forEach(button => builder.addButton(button))
      }

      builder.shouldEndSession(reply.endSession)
    }

    return builder.get()
  }

  private _sendReply(replyMessage: WebhookResponse): any {
    if (this._isReplied) {
      throw new Error('Повторная отправка ответа невозможна. Команда должна либо возвращать ответ либо вызывать Context.reply.')
    }

    this._isReplied = true
    
    /*
     * That fires when listening on port.
     */
    if (typeof this.sendResponse === 'function') {
      eventEmitter.dispatch(EVENT_MESSAGE_SENT, {
        data: replyMessage.response.text, session: this.req.session,
      })

      return this.sendResponse(replyMessage)
    }
    return replyMessage
  }
}

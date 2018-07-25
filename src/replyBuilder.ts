import {
  DEFAULT_END_SESSION,
  ALICE_PROTOCOL_VERSION,
} from './constants'

import { WebhookResponse } from './types/webhook'
import { BigImageCard, ItemsListCard } from './types/card'

export interface WebhookResponse {
  response: {
    text?: string,
    tts?: string,
    buttons: any[], // @TODO: change to button type
    end_session: boolean,
  },
  version: string,
  session?: {},
}
export default class ReplyBuilder {
  public reply: WebhookResponse

  constructor(request) {
    this.reply = {
      response: {
        buttons: [],
        end_session: DEFAULT_END_SESSION,
      },
      version: ALICE_PROTOCOL_VERSION,
    }

    if (request) {
      this.reply.session = request.session
    }
  }

  public text(textMessage) {
    if (!textMessage) {
      throw new Error('Text message for reply could not be empty!')
    }
    this.reply.response.text = textMessage
    return this
  }

  public tts(ttsMessage) {
    if (!ttsMessage) {
      throw new Error('Text-to-speech message for Alice can not be empty!')
    }
    this.reply.response.tts = ttsMessage
    return this
  }

  public addButton(button) {
    if (!button) {
      throw new Error('Button block can not be empty!')
    }
    this.reply.response.buttons.push(button)
    return this
  }

  public card(card: BigImageCard | ItemsListCard) {
    if (!card) {
      throw new Error('Card block can not be empty!')
    }
    
    this.reply.response.card = card
    return this
  }

  public shouldEndSession(flag) {
    this.reply.response.end_session = flag
    return this
  }

  public get() {
    return this.reply
  }
}
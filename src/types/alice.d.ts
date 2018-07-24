import { IContext } from './context'
import { ICommand } from './command'

export interface IConfig {
  fuseOptions?: {}
  sessionsLimit?: number
  oAuthToken?: string
  skillId?: string
  devServerUrl?: string
  responseTimeout?: number
}
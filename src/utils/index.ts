import { WebhookRequest } from '../types/webhook'

const formatToken = (token) => token
  .replace('$', '')
  .replace('{', '')
  .replace('}', '')

const MATCH_REGEX = /\${([a-z0-9]+)}/gi
const SEARCH_REGEX_STR = '(.*)'

function extractTemplateTokenNames(template) {
  const matchedTokens = template.match(MATCH_REGEX).map(formatToken)
  const tokensObject = {}
  matchedTokens.forEach((token, index) => { tokensObject[token] = index })
  return tokensObject
}

export function searchFiguresInString(template, stringFigure: string) {
  const searchTemplateRegex = getFiguresRegexp(template)
  const matched = searchTemplateRegex.exec(stringFigure)
  return matched.filter(Boolean).slice(1)
}

export function getFiguresRegexp(figure) {
  const searchTemplate = figure.replace(MATCH_REGEX, SEARCH_REGEX_STR)
  return new RegExp(searchTemplate, 'ig')
}

function connectTokensWithFigures(tokens, figures) {
  const res = {}
  for (const token in tokens) {
    if (figures[tokens[token]]) {
      res[token] = figures[tokens[token]] || null
    }
  }
  return res
}

export function reversedInterpolation(template: string, searchString: string) {
  if (!template) { throw new Error('No template provided') }
  if (!searchString) { throw new Error('No searchString provided') }
  const tokens = extractTemplateTokenNames(template)
  const figures = searchFiguresInString(template, searchString)
  return connectTokensWithFigures(tokens, figures)
}

export const selectCommand = (req: WebhookRequest): string => req.request.command
export const selectSession = (req: WebhookRequest) => req.session
export const selectSessionId = (req: WebhookRequest) => selectSession(req).session_id
export const selectUserId = (req: WebhookRequest) => selectSession(req).user_id
export const isFunction = (fn: (args: any) => any) => fn && typeof fn === 'function'
export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
export const rejectsIn = (ms: number) => new Promise((resolve, reject) => setTimeout(reject, ms))

export default {
  getFiguresRegexp,
  selectCommand,
  selectSession,
  selectSessionId,
  selectUserId,
  isFunction,
  reversedInterpolation,
}

import Alice from '../alice'
import Scene from '../scene'
import { bigImageCard } from '../card'
import { generateRequest } from './testUtils'

test('Command отправляет текстовый ответ при вызове ctx.reply( String )', done => {
  const alice = new Alice()
  alice.command('Как дела', ctx => ctx.reply('Хорошо'))

  alice.handleRequest(generateRequest('Как дела'), res => {
    expect(res.response.text).toBe('Хорошо')
    done()
  })
})

test('Welcome отправляет текстовый ответ при возврате строки', done => {
  const alice = new Alice()
  alice.welcome(() => 'Хорошо')

  alice.handleRequest(generateRequest(''), res => {
    expect(res.response.text).toBe('Хорошо')
    done()
  })
})

test('Command отправляет текстовый ответ при возврате строки', done => {
  const alice = new Alice()
  alice.command('Как дела', () => 'Хорошо')

  alice.handleRequest(generateRequest('Как дела'), res => {
    expect(res.response.text).toBe('Хорошо')
    done()
  })
})

test('Any отправляет текстовый ответ при возврате строки', done => {
  const alice = new Alice()
  alice.any(() => 'Хорошо')

  alice.handleRequest(generateRequest(''), res => {
    expect(res.response.text).toBe('Хорошо')
    done()
  })
})

test('Command отправляет карточку при возврате {card: BigImageCard}', done => {
  const alice = new Alice()

  alice.command('Как дела', () => {
    return { card: bigImageCard({ image_id: 'some-image-id' }) }
  })

  alice.handleRequest(generateRequest('Как дела'), res => {
    expect(res.response.card.type === 'BigImage' && res.response.card.image_id).toBe('some-image-id')
    done()
  })
})

test('Scene.command отправляет текстовый ответ при возврате строки', async done => {
  const alice = new Alice()
  const scene = new Scene('scene')

  alice.registerScene(scene)
  alice.command('Вход в сцену', ctx => {
    ctx.enterScene(scene)
    return 'В сцене.'
  })

  scene.command('Как дела', () => 'В сцене хорошо');

  await alice.handleRequest(generateRequest('Вход в сцену'))

  alice.handleRequest(generateRequest('Как дела'), res => {
    expect(res.response.text).toBe('В сцене хорошо')
    done()
  })
})

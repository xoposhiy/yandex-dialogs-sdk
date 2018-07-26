import Alice from '../alice'
import Scene from '../scene'
import { generateRequest } from './testUtils'

test('creating scene with name', () => {
  const scene = new Scene('testName')
  expect(scene.name).toBe('testName')
})

test('registering an array of scenes', () => {
  const alice = new Alice()
  const scene1 = new Scene('scene1')
  const scene2 = new Scene('scene2')

  alice.registerScene([scene1, scene2])

  // yup it's a private method but who cares whatsoever?..
  expect(alice.scenes.length).toBe(2)
})

test('register scene and enter in', async done => {
  const alice = new Alice()
  const scene = new Scene('123')

  scene.enter('1', ctx => ctx.reply('enter'))
  scene.any(ctx => ctx.reply('scene-any'))
  scene.command('3', ctx => ctx.reply('command'))
  scene.leave('2', ctx => ctx.reply('leave'))

  alice.registerScene(scene)
  alice.any(ctx => ctx.reply('hi'))

  await alice.handleRequest(generateRequest('hello'), res => {
    expect(res.response.text).toBe('hi')
  })

  await alice.handleRequest(generateRequest('1'), res => {
    expect(res.response.text).toBe('enter')
  })

  await alice.handleRequest(generateRequest('blablabla'), res => {
    expect(res.response.text).toBe('scene-any')
  })

  await alice.handleRequest(generateRequest('2'), res => {
    expect(res.response.text).toBe('leave')
  })

  done()
})

test('changing scene', async done => {
  const alice = new Alice()
  const scene1 = new Scene('scene1')
  const scene2 = new Scene('scene2')

  scene1.enter('keyword', ctx => {
    ctx.enterScene(scene2)
    ctx.reply('scene1')
  })

  scene2.any(ctx => {
    ctx.leaveScene()
    ctx.reply('scene2')
  })

  alice.registerScene([scene1, scene2])
  alice.any(ctx => ctx.reply('main'))

  await alice.handleRequest(generateRequest('hello'), res => {
    expect(res.response.text).toBe('main')
  })

  // Test scene1 change scene method (ctx.enterScene)
  await alice.handleRequest(generateRequest('keyword'), res => {
    expect(res.response.text).toBe('scene1')
  })

  // Test scene2 leave method
  await alice.handleRequest(generateRequest('hello'), res => {
    expect(res.response.text).toBe('scene2')
  })

  await alice.handleRequest(generateRequest('hello'), res => {
    expect(res.response.text).toBe('main')
  })

  done()
})

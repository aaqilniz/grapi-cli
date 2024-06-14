import {expect, test} from '@oclif/test'

describe('auth:users', () => {
  test
  .stdout()
  .command(['auth:users'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['auth:users', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

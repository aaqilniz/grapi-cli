import {expect, test} from '@oclif/test'

describe('openapi:complete-flow', () => {
  test
  .stdout()
  .command(['openapi:complete-flow'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['openapi:complete-flow', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import { expect, test } from '@oclif/test'

describe('interceptor', () => {
  test
    .stdout()
    .command(['interceptor'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['interceptor', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

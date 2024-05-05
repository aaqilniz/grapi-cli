import { expect, test } from '@oclif/test'

describe('fuzzy', () => {
  test
    .stdout()
    .command(['fuzzy'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['fuzzy', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

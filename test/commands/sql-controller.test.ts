import { expect, test } from '@oclif/test'

describe('sql-controller', () => {
  test
    .stdout()
    .command(['sql-controller'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['sql-controller', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

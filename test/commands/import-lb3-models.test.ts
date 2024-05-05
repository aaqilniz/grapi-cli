import { expect, test } from '@oclif/test'

describe('import-lb3-models', () => {
  test
    .stdout()
    .command(['import-lb3-models'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['import-lb3-models', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

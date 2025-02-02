import {expect, test} from '@oclif/test'

describe('app:controller-dir', () => {
  test
  .stdout()
  .command(['app:controller-dir'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['app:controller-dir', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

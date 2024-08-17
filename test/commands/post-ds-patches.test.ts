import {expect, test} from '@oclif/test'

describe('post-ds-patches', () => {
  test
  .stdout()
  .command(['post-ds-patches'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['post-ds-patches', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

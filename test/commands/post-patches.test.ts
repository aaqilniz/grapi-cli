import {expect, test} from '@oclif/test'

describe('post-patches', () => {
  test
  .stdout()
  .command(['post-patches'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['post-patches', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import {expect, test} from '@oclif/test'

describe('pre-relation-patches', () => {
  test
  .stdout()
  .command(['pre-relation-patches'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['pre-relation-patches', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

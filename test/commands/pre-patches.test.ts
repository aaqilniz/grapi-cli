import {expect, test} from '@oclif/test'

describe('pre-patches', () => {
  test
  .stdout()
  .command(['pre-patches'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['pre-patches', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import {expect, test} from '@oclif/test'

describe('property:mark-hidden', () => {
  test
  .stdout()
  .command(['property:mark-hidden'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['property:mark-hidden', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import {expect, test} from '@oclif/test'

describe('property:remove', () => {
  test
  .stdout()
  .command(['property:remove'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['property:remove', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

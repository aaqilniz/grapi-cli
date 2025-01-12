import {expect, test} from '@oclif/test'

describe('authorization:assign-role', () => {
  test
  .stdout()
  .command(['authorization:assign-role'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['authorization:assign-role', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

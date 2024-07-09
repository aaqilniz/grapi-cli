import {expect, test} from '@oclif/test'

describe('external:operation', () => {
  test
  .stdout()
  .command(['external:operation'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['external:operation', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

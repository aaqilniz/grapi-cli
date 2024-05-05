import { expect, test } from '@oclif/test'

describe('rest-crud', () => {
  test
    .stdout()
    .command(['rest-crud'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['rest-crud', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})

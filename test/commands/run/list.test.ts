import { expect, test } from '@salesforce/command/lib/test';

describe('run:list', () => {

  test
    .withProject({})
    .stdout()
    .stderr()
    .command(['run:list'])
    .it('reports no script defined with empty project', ctx => {
      expect(ctx.stdout).to.contain('No scripts are defined.');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'foo': [],
          'bar': []
        }
      }
    })
    .stdout()
    .stderr()
    .command(['run:list'])
    .it('lists named scripts in the order they are defined', ctx => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

});

import { expect, test } from '@salesforce/command/lib/test';

describe('run', () => {
  test
    .withProject({})
    .stdout()
    .stderr()
    .command(['run'])
    .exit(1)
    .it('exits (1) and reports no script declared when no script provided', ctx => {
      expect(ctx.stderr).to.contain('no script declared');
    });

  test
    .withProject({})
    .stdout()
    .stderr()
    .command(['run', 'myScript'])
    .exit(1)
    .it('exits (1) and reports script not found when script is not defined in project', ctx => {
      expect(ctx.stderr).to.contain('script not found');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': 'version'
        }
      }
    })
    .stderr()
    .command(['run', 'myScript'])
    .it('can run a single-line script', ctx => {
      expect(ctx.stderr).to.contain('version... ✔︎');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': [
            'version',
            'plugins'
          ]
        }
      }
    })
    .stderr()
    .command(['run', 'myScript'])
    .it('can run a multi-step', ctx => {
      expect(ctx.stderr).to.contain('version... ✔︎');
      expect(ctx.stderr).to.contain('plugins... ✔︎');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': [
            'version'
          ]
        }
      }
    })
    .stderr()
    .stdout()
    .timeout(10000)
    .command(['run', 'myScript', '--verbose'])
    .it('prints stdout with the --verbose flag is used', ctx => {
      expect(ctx.stderr).to.contain('version... ✔︎');
      expect(ctx.stdout).to.contain('sfdx-cli/');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': [
            '# Show Plugins',
            'plugins'
          ]
        }
      }
    })
    .stderr()
    .command(['run', 'myScript'])
    .it('supports section headings', ctx => {
      expect(ctx.stderr).to.contain('Show Plugins');
      expect(ctx.stderr).to.contain('plugins... ✔︎');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': [
            'plugins',
            'run otherscript'
          ],
          'otherscript': [
            'version',
            'help'
          ]
        }
      }
    })
    .stderr()
    .command(['run', 'myScript'])
    .it('supports nested script calls', ctx => {
      expect(ctx.stderr).to.contain('plugins... ✔︎');
      expect(ctx.stderr).to.contain('version... ✔︎');
      expect(ctx.stderr).to.contain('help... ✔︎');
    });

  test
    .env({
      'myParam': 'defaultusername'
    })
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': [
            'force:config:set $myParam=foo@bar.com'
          ]
        }
      }
    })
    .stderr()
    .command(['run', 'myScript'])
    .it('replaces environment variables in scripts', ctx => {
      expect(ctx.stderr).to.contain('force:config:set $myParam=foo@bar.com... ✔︎');
    });

  test
    .withProject({
      'plugins': {
        'scripts': {
          'myScript': [
            'plugins',
            '. otherscript'
          ],
          'otherscript': [
            'version',
            'help'
          ]
        }
      }
    })
    .stderr()
    .command(['run', 'myScript'])
    .it('supports "." as an alias for "run"', ctx => {
      expect(ctx.stderr).to.contain('plugins... ✔︎');
      expect(ctx.stderr).to.contain('version... ✔︎');
      expect(ctx.stderr).to.contain('help... ✔︎');
    });
});

import { expect } from '@salesforce/command/lib/test';

import { envsub } from '../src/util';

describe('envsub', () => {
  it('does not impact strings with no replacements', () => {
    const input = 'hello world';
    const result = envsub(input);
    expect(result).to.equal(input);
  });
  it('supports dollar-sign notation', () => {
    process.env.hello = 'foobar';
    const input = '$hello world';
    const result = envsub(input);
    expect(result).to.equal('foobar world');
  });
  it('supports dollar-brace notation', () => {
    process.env.hello = 'foobar';
    const input = '${ hello } world';
    const result = envsub(input);
    expect(result).to.equal('foobar world');
  });
  it('replaces missing params with blanks', () => {
    const input = '$nope world';
    const result = envsub(input);
    expect(result).to.equal(' world');
  });
  it('supports multiple replacesments in a single string', () => {
    process.env.hello = 'foobar';
    process.env.world = 'magic';

    expect(envsub('$hello/$world')).to.equal('foobar/magic');
    //expect(envsub('$hello/${ world }')).to.equal('foobar/magic');
    //expect(envsub('${ hello }/${ world }')).to.equal('foobar/magic');
  });
});
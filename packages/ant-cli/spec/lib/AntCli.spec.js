/* eslint-disable no-console */

/**
 * @fileoverview Tests for lib/AntCli.js file.
 */

const path = require('path');
const fs = require('fs');
const YError = require('yargs/lib/yerror');
const { logger } = require('@back4app/ant-util');
const { Ant } = require('@back4app/ant');
const AntCli = require('../../lib/AntCli');

const utilPath = fs.realpathSync(path.resolve(
  __dirname,
  '../../node_modules/@back4app/ant-util-tests'
));

describe('lib/AntCli.js', () => {
  test('should export "AntCli" class with "execute" method', () => {
    const antCli = new AntCli();
    expect(antCli.constructor.name).toEqual('AntCli');
    expect(antCli.execute).toEqual(expect.any(Function));
  });

  test('should load global config', () => {
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain('  Core');
    } catch (e) {
      throw e;
    } finally {
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('should load custom config', () => {
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(path.resolve(
      utilPath,
      'configs/fooPluginConfig'
    ));
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain('FooPlugin');
    } catch (e) {
      throw e;
    } finally {
      process.exit = originalExit;
      console.log = originalLog;
      process.chdir(originalCwd);
    }
  });

  test('should load custom config with --config option', () => {
    const originalArgv = process.argv;
    process.argv = [];
    process.argv.push('--config');
    process.argv.push(path.resolve(
      utilPath,
      'configs/fooPluginConfig/ant.yml'
    ));
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(__dirname);
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain('FooPlugin');
    } catch (e) {
      throw e;
    } finally {
      process.argv = originalArgv;
      process.exit = originalExit;
      process.chdir(originalCwd);
      console.log = originalLog;
    }
  });

  test('should run with --config option', (done) => {
    expect.hasAssertions();
    const originalArgv = process.argv;
    process.argv = [];
    process.argv.push('--version');
    process.argv.push('--config');
    const configPath = path.resolve(
      utilPath,
      'configs/fooPluginConfig/ant.yml'
    );
    process.argv.push(configPath);
    const originalExit = process.exit;
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(__dirname);
    process.exit = jest.fn(code => {
      expect(code).toEqual(0);
      process.argv = originalArgv;
      process.exit = originalExit;
      process.chdir(originalCwd);
      console.log = originalLog;
      done();
    });
    (new AntCli())._yargs.parse(`--version --config ${configPath}`);
  });

  test('should fail with --config and no args', () => {
    const originalArgv = process.argv;
    process.argv = [];
    process.argv.push('--config');
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalError = console.error;
    console.error = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(__dirname);
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error.mock.calls[0][0]).toContain(
        'Config option requires path argument'
      );
    } catch (e) {
      throw e;
    } finally {
      process.argv = originalArgv;
      process.exit = originalExit;
      process.chdir(originalCwd);
      console.log = originalLog;
      console.error = originalError;
    }
  });

  test('should work with no plugins', () => {
    const originalGetGlobalConfig = Ant.prototype._getGlobalConfig;
    jest.spyOn(Ant.prototype, '_getGlobalConfig').mockImplementation(() => {
      return {};
    });
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).not.toContain('Plugins:');
    } catch (e) {
      throw e;
    } finally {
      Ant.prototype._getGlobalConfig = originalGetGlobalConfig;
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('should load config with no plugins', () => {
    const originalArgv = process.argv;
    process.argv = ['--config', 'ant.yml'];
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    const currentDir = path.resolve(
      utilPath,
      'configs/noPluginsConfig'
    );
    process.chdir(currentDir);
    const originalWriteFileSync = fs.writeFileSync;
    fs.writeFileSync = jest.fn();
    try {
      (new AntCli())._yargs.parse('--config ant.yml');
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain(`Plugins:
  Core
`);
    } catch (e) {
      throw e;
    } finally {
      process.exit = originalExit;
      console.log = originalLog;
      process.chdir(originalCwd);
      process.argv = originalArgv;
      fs.writeFileSync = originalWriteFileSync;
    }
  });

  test('should not load invalid config', () => {
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalError = console.error;
    console.error = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(path.resolve(
      utilPath,
      'configs/invalidConfig'
    ));
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error.mock.calls[0][0]).toContain(
        'Could not load config'
      );
    } catch (e) {
      throw e;
    } finally {
      process.exit = originalExit;
      console.log = originalLog;
      console.error = originalError;
      process.chdir(originalCwd);
    }
  });

  test('should show verbose message when not using --verbose option', () => {
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(path.resolve(
      utilPath,
      'configs/notAPluginConfig'
    ));
    try {
      (new AntCli()).execute();
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain(
        'For getting the error stack, use --verbose option'
      );
    } catch (e) {
      throw e;
    } finally {
      process.exit = originalExit;
      console.log = originalLog;
      process.chdir(originalCwd);
    }
  });

  test('should show stack when using --verbose option', () => {
    const originalArgv = process.argv;
    process.argv.push('--verbose');
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(path.resolve(
      utilPath,
      'configs/notAPluginConfig'
    ));
    try {
      (new AntCli())._yargs.parse('--verbose');
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain(
        'at PluginController._loadPlugin'
      );
    } catch (e) {
      throw e;
    } finally {
      process.argv = originalArgv;
      process.exit = originalExit;
      console.log = originalLog;
      process.chdir(originalCwd);
    }
  });

  test('should show stack when using -v option', () => {
    const originalArgv = process.argv;
    process.argv.push('-v');
    const originalExit = process.exit;
    process.exit = jest.fn();
    const originalLog = console.log;
    console.log = jest.fn();
    const originalCwd = process.cwd();
    process.chdir(path.resolve(
      utilPath,
      'configs/notAPluginConfig'
    ));
    try {
      (new AntCli())._yargs.parse('-v');
      expect(process.exit).toHaveBeenCalledWith(0);
      expect(console.log.mock.calls[0][0]).toContain(
        'at PluginController._loadPlugin'
      );
    } catch (e) {
      throw e;
    } finally {
      process.argv = originalArgv;
      process.exit = originalExit;
      console.log = originalLog;
      process.chdir(originalCwd);
    }
  });

  test(
    'should print error when calling with an inexistent command',
    () => {
      const originalExit = process.exit;
      process.exit = jest.fn();
      const originalError = console.error;
      console.error = jest.fn();
      try {
        (new AntCli())._yargs.parse('foo');
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error.mock.calls[0][0]).toContain(
          'Fatal => Unknown command: foo'
        );
      } catch (e) {
        throw e;
      } finally {
        process.exit = originalExit;
        console.error = originalError;
      }
    }
  );

  test(
    'should suggest commands',
    () => {
      const originalExit = process.exit;
      process.exit = jest.fn();
      const originalError = console.error;
      console.error = jest.fn();
      try {
        (new AntCli())._yargs.parse('creat');
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error.mock.calls[0][0]).toContain(
          'Fatal => Did you mean create?'
        );
      } catch (e) {
        throw e;
      } finally {
        process.exit = originalExit;
        console.error = originalError;
      }
    }
  );

  test(
    'should throw error when something goes wrong',
    () => {
      expect(() => (new AntCli())._yargs.command(
        'foo',
        'foo description',
        () => {},
        () => { throw new YError('Something went wrong'); }
      ).parse('foo')).toThrowError('Something went wrong');
    }
  );

  test(
    'should throw friendly error when not passing required arg to option',
    () => {
      const originalExit = process.exit;
      process.exit = jest.fn();
      const originalError = console.error;
      console.error = jest.fn();
      try {
        (new AntCli())._yargs.command(
          'foo',
          'foo description',
          { option: { requiresArg: true }},
          () => { throw new YError('Not enough arguments following: '); }
        ).parse('foo');
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.error.mock.calls[0][0]).toContain(
          'Not enough arguments following: '
        );
      } catch (e) {
        throw e;
      } finally {
        process.exit = originalExit;
        console.error = originalError;
      }
    }
  );

  test(
    'should attach console.log to logger handlers when using --verbose option',
    () => {
      expect.hasAssertions();
      const originalExit = process.exit;
      process.exit = jest.fn();
      const originalError = console.error;
      console.error = jest.fn();
      try {
        (new AntCli())._yargs.parse('foo --verbose');
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(logger._handlers).toEqual(expect.any(Set));
        expect(logger._handlers.size).toEqual(1);
        expect(Array.from(logger._handlers.values())[0]).toEqual(console.log);
      } catch (e) {
        throw e;
      } finally {
        process.exit = originalExit;
        console.error = originalError;
      }
    }
  );

  test('should load base path', () => {
    const originalCwd = process.cwd();
    const currentDir = path.resolve(utilPath, 'configs/basePathConfig');
    process.chdir(currentDir);
    const antCli = new AntCli();
    const basePath = path.resolve(currentDir, '../../');
    expect(antCli._ant._config.basePath).toEqual(basePath);
    expect(antCli._ant._config.plugins).toEqual(expect.any(Array));
    expect(antCli._ant._config.plugins).toHaveLength(1);
    expect(antCli._ant._config.plugins[0]).toEqual(
      path.resolve(basePath, './plugins/FooPlugin.js')
    );
    expect(antCli._ant.pluginController.plugins).toEqual(expect.any(Array));
    expect(antCli._ant.pluginController.plugins).toHaveLength(2);
    expect(antCli._ant.pluginController.plugins[0].name).toEqual('Core');
    expect(antCli._ant.pluginController.plugins[1].name).toEqual('FooPlugin');
    process.chdir(originalCwd);
  });
});

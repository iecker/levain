import {LogRecord} from "https://deno.land/std/log/logger.ts"
import {LogLevels} from "https://deno.land/std/log/levels.ts"
import Config from "../config.ts";
import {MockPackage} from "../package/mock_package.ts";
import OsUtils from '../os_utils.ts';

export default class TestHelper {
    static getConfig(): Config {
        const myArgs = {};
        return new Config(myArgs)
    };

    static logRecord(
        msg: string = 'mock logRecord',
        level: LogLevels = LogLevels.INFO,
    ) {
        return new LogRecord({
            msg,
            args: [],
            level,
            loggerName: 'anyLogger',
        })
    }

    static mockPackage() {
        return new MockPackage()
    }

    static thisFolderDoesNotExist = 'this-folder-does-not-exist';
    static anotherFolderThatDoesNotExist = 'another-folder-that-does-not-exist';
    static folderThatAlwaysExists = OsUtils.homeDir;

}

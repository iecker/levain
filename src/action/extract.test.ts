import {assertEquals,} from "https://deno.land/std/testing/asserts.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import TestHelper from "../lib/test/test_helper.ts";
import {assertFolderIncludes} from "../lib/test/more_asserts.ts";
import FileCache from '../lib/fs/file_cache.ts';
import Extract from "./extract.ts";

Deno.test('ExtractAction should check if source exists', async () => {
    const src = TestHelper.fileThatDoesNotExist
    const dst = TestHelper.folderThatDoesNotExist
    const config = TestHelper.getConfig()
    const action = new Extract(config)
    const pkg = TestHelper.mockPackage()
    try {
        await action.execute(pkg, [src, dst])
    } catch (err) {

        const expectedMsg = `File ${src} does not exist`
        assertEquals(err.message, expectedMsg)
    }
})

Deno.test({
    name: 'ExtractAction should extract src to dst',
    fn: async () => {
        const src = TestHelper.validZipFile
        const dst = Deno.makeTempDirSync()
        const config = TestHelper.getConfig()
        config.levainCacheDir = Deno.makeTempDirSync()
        const action = new Extract(config)
        const pkg = TestHelper.mockPackage()

        await action.execute(pkg, [src, dst])

        const expectedFiles = [
            path.join(dst, 'test'),
            path.join(dst, 'test', 'abc.txt'),
            path.join(dst, 'test', 'hello.txt'),
        ];
        assertFolderIncludes(dst, expectedFiles);
    },
    sanitizeResources: false,
    sanitizeOps: false,
})
Deno.test({
    name: 'ExtractAction should use cache',
    fn: async () => {
        const src = TestHelper.validZipFile
        const dst = Deno.makeTempDirSync()
        const config = TestHelper.getConfig()
        config.levainCacheDir = Deno.makeTempDirSync()
        const action = new Extract(config)
        const pkg = TestHelper.mockPackage()
        const cachedSrc = new FileCache(config).cachedFilePath(src)

        await action.execute(pkg, [src, dst])

        assertFolderIncludes(config.levainCacheDir, [cachedSrc])
    },
    sanitizeResources: false,
    sanitizeOps: false,
})

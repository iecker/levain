import Config from "../lib/config.ts";
import NullRepository from "../lib/repository/null_repository.ts";
import TestLogger from "../lib/logger/test_logger.ts";
import {assertArrayEndsWith} from '../lib/test/more_asserts.ts';

import ListCommand from "./list_command.ts";
import TestHelper from "../lib/test/test_helper.ts";

Deno.test('ListCommand should list nullRepo', async () => {

    const logger = await TestLogger.setup()

    const config = new Config([]);
    config.repositoryManager.repository = new NullRepository(config)
    const list = new ListCommand(config)

    list.execute()

    assertArrayEndsWith(
        logger.messages,
        [
            "INFO ",
            "INFO ==================================",
            "INFO list \"\"",
            "INFO = Repository:",
            "INFO   nullRepo",
            "INFO   no packages found",
        ]
    )

})

Deno.test('ListCommand should list packages available in a repo', async () => {

    const logger = await TestLogger.setup()
    const config = new Config([]);
    config.repositoryManager.repository = await TestHelper.getMockRepositoryInitialized()
    const list = new ListCommand(config)

    list.execute()
    
    assertArrayEndsWith(
        logger.messages,
        [
            "INFO ",
            "INFO ==================================",
            "INFO list \"\"",
            "INFO = Repository:",
            "INFO   mockRepo",
            "INFO   2 packages found",
            "INFO ",
            "INFO == Packages",
            "INFO    anotherPackage                 0.1.2      => /mock/anotherPackage-0.1.2.yml",
            "INFO    aPackage                       1.0.1      => /mock/aPackage-1.0.1.yml",
        ]
    )
})

Deno.test('ListCommand should list packages that match a search string', async () => {
    const searchString = 'another'
    const logger = await TestLogger.setup()
    const config = new Config([]);
    config.repositoryManager.repository = await TestHelper.getMockRepositoryInitialized()
    const list = new ListCommand(config)

    list.execute([searchString])

    assertArrayEndsWith(
        logger.messages,
        [
            "INFO ",
            "INFO ==================================",
            "INFO list \"another\"",
            "INFO = Repository:",
            "INFO   mockRepo",
            "INFO   1 of 2 packages found",
            "INFO ",
            "INFO == Package",
            "INFO    anotherPackage                 0.1.2      => /mock/anotherPackage-0.1.2.yml",
            "INFO    aPackage                       1.0.1      => /mock/aPackage-1.0.1.yml",
        ]
    )
})


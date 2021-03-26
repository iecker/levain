import TestHelper from "../lib/test/test_helper.ts";
import ActionFactory from "./action_factory.ts";
import AddToStartMenuAction from "./add-to-start-menu.ts";
import {assert} from "https://deno.land/std/testing/asserts.ts";
import OsUtils from "../lib/os/os_utils.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { assertFileExists } from "../lib/test/more_asserts.ts";


Deno.test('should be obtainable with action factory', () => {
    const config = TestHelper.getConfig()
    const factory = new ActionFactory()
    const action = factory.get("addToStartMenu", config)

    assert(action instanceof AddToStartMenuAction)
})

if (OsUtils.isWindows()) { 
    Deno.test("Should create shortcut in the start menu folder", async () => { 
        //Given the shortcut doesn't exist in the start menu already
        const userProfile = Deno.env.get("USERPROFILE");
        const startMenuPath = `${userProfile}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs`;
        const fileName = "document.txt";
        const shortcutPath = path.resolve(startMenuPath, `${fileName}.lnk`);

        const currentFileDir = path.dirname(import.meta.url);
        const filePath = `${currentFileDir}/../../testdata/add_to_startup/${fileName}`;
        
        if (existsSync(shortcutPath)) { 
            Deno.removeSync(shortcutPath);
        }

        //when I execute the action
        const action = getStartMenuAction(); 
        await action.execute(TestHelper.mockPackage(), [filePath]);

        //Then the shortcut should exist in the startup folder
        assertFileExists(shortcutPath);
    })   
}

function getStartMenuAction() {
    const config = TestHelper.getConfig()
    const factory = new ActionFactory()
    const action = factory.get("addToStartMenu", config)
    return action;
}
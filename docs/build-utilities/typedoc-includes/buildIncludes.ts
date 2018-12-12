/*!
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 *
 */

import * as fs from "fs";
import * as path from "path";
import * as mkdirp from "mkdirp";

/**
 * Recurse through all files present in a directory. If a file is a directory
 * then the function will call itself and search that directory. Otherwise
 * includes will be resolved in the file.
 *
 * @param directory The absolute directory path to recurse through.
 */
function recurseDirectory(directory: string) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const resolvedFile = `${directory}/${file}`;
        const stat = fs.statSync(resolvedFile);

        if (stat.isFile() && path.parse(resolvedFile).ext === ".md") {
            const finalText = resolveIncludes(
                fs.readFileSync(resolvedFile).toString(),
                resolvedFile,
                []
            );

            const saveLocation = path.join(__dirname, path.relative(__dirname, resolvedFile).replace("src", "resolved"));
            mkdirp.sync(path.join(saveLocation, "../"));

            console.log(`RESOLVED INCLUDES IN: ${saveLocation}`); //tslint:disable-line

            fs.writeFileSync(saveLocation, finalText, {
                flag: "w+"
            });

        } else if(stat.isDirectory()) {
            recurseDirectory(resolvedFile);
        }
    }
}

/**
 * This function will check textual content for an includes tag and will replace
 * it with contents from the specified file. The format for this tag is
 * <meta name="include" content="<FILE_LOCATION>"/>.
 *
 * @param text The current text content to check for includes.
 * @param relativeTo The location where includes should be relative to.
 * @param stack The current recursion stack.
 *
 * @returns The textual content with any includes resolved.
 *
 * @throws When a circular includes was detected
 * @throws When an include tag is missing the location
 */
function resolveIncludes(text: string, relativeTo: string, stack: string[] = []): string {
    if (stack.indexOf(relativeTo) !== -1) {
        throw new Error(`Include loop detected in ${stack[0]}`); // The first element is in error
    }

    const findTag = /\<meta\s*name="include"\s*.*\>/g;
    const findImport = /content="(.*)"\/\>/;

    text = text.replace(findTag, (tag) => {
        const fileLocation = tag.match(findImport)[1];

        if (fileLocation) {
            const importLocation = path.join(relativeTo, "..", fileLocation);

            stack.push(relativeTo);

            return resolveIncludes(
                fs.readFileSync(importLocation).toString(),
                importLocation,
                stack
            );
        } else {
            throw new Error(`Missing include content in file ${relativeTo}`);
        }
    });

    stack.pop();

    return text;
}

// Start the recursion in the proper source. Saved files will exist under ./resolved
recurseDirectory(`${__dirname}/src`);

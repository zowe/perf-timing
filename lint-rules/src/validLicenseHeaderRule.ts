/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 *
 */

import * as ts from "typescript";
import * as Lint from "tslint";
import * as fs from "fs";

/**
 * This rule ensures that a license header file is honored in TypeScript and JavaScript
 * files.
 */
export class Rule extends Lint.Rules.AbstractRule {
    /**
     * Error string for when more than one license comment was detected.
     */
    public static DUPLICATE_LICENSE_COMMENT_STRING = "duplicate license comment";

    /**
     * Error string for when the license comment is not the first line of the file.
     */
    public static INVALID_LICENCE_LOCATION_STRING = "license comment must be first line of file";

    /**
     * Error string for when the license comment does not match what should be there.
     */
    public static INVALID_LICENSE_TEXT_STRING = "license text does not match loaded license";

    /* tslint:disable:object-literal-sort-keys */
    /**
     * Metadata for tslint
     */
    public static metadata: Lint.IRuleMetadata = {
        ruleName: "valid-license-header",
        description:
            "Enforces a certain header comment for all files, matched by the contents of a license header file.",
        optionsDescription: Lint.Utils.dedent`
            The first option, which is mandatory, is the filePath to a License Header file.`,
        options: {
            type: "array",
            items: [
                {
                    type: "string",
                }
            ],
            additionalItems: false,
            minLength: 1,
            maxLength: 1,
        },
        optionExamples: [[true, "HEADER_FILE"]],
        hasFix: true,
        type: "style",
        typescriptOnly: false,
    };
    /* tslint:enable:object-literal-sort-keys */

    /**
     * Error string for when the header is not found.
     */
    public static MISSING_HEADER_FAILURE_STRING = "missing file header";

    /**
     * Error string for when the header does not have a new line immediately after it.
     */
    public static MISSING_NEW_LINE_FAILURE_STRING = "missing new line following the file header";

    /**
     * The heading contents loaded from the file in the constructor.
     */
    public readonly headingContents: string;

    /**
     * The heading regular expression match. Matching this regex only implies that
     * a comment is a block comment with each line present in the comment. There
     * might be misc text in between.
     *
     * This expression is used to find a license comment that might be present
     * within a plain /* block and not a /*! block.
     */
    public readonly headingRegExp: RegExp;

    constructor(options: Lint.IOptions) {
        super(options);

        // Define the contents to write
        this.headingContents = fs.readFileSync(this.ruleArguments[0] as string).toString();

        // Define the regular expression to match
        const fileLines = this.headingContents.split("\n");
        let regexString = "";
        for(const line of fileLines) {
            regexString += `${line}.*`;
        }

        regexString += "\\n\\s*\\*\\/";

        this.headingRegExp = new RegExp(regexString, "s");
    }

    /**
     * Called by tslint to as the rule parser.
     *
     * @param sourceFile Source file passed by tslint
     * @returns An array of failures.
     */
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const failures: Lint.RuleFailure[] = [];

        const { text } = sourceFile;

        // ignore shebang if it exists
        const offset = text.startsWith("#!") ? text.indexOf("\n") : 0;

        const headerCommentFormat = this._getHeaderComment(sourceFile);

            // First get all the comments available in the file. We do this to ensure
            // that no duplication exists.
        const comments: ts.CommentRange[] = this._getComments(sourceFile, text);

        if (sourceFile.fileName.indexOf("Environment.ts") !== -1) {
            console.log(comments);
        }

            // Next we will filter out those comments that do not match our file
            // input.
        const passingComments: ts.CommentRange[] = [];

        for (const comment of comments) {
            const commentContent = text.substring(comment.pos, comment.end);

                // Verify that the range matches
            if (/^\/\*\!/.test(commentContent) || this.headingRegExp.test(commentContent)) {
                passingComments.push(comment);
            }
        }

            // Check that we had at least one possible valid comment.
            // If there were none, the fix is to just create it at the start.
        if (passingComments.length <= 0) {
            failures.push(new Lint.RuleFailure(
                    sourceFile,
                    offset,
                    offset,
                    Rule.MISSING_HEADER_FAILURE_STRING,
                    this.ruleName,
                    Lint.Replacement.appendText(offset, headerCommentFormat)
                ));
        } else {
                // For every comment after the first license one, mark it as an error
                // with the fix to remove the duplicate.
            for (let i = 1; i < passingComments.length; i++) {
                const badComment = passingComments[i];

                failures.push(new Lint.RuleFailure(
                        sourceFile,
                        badComment.pos,
                        badComment.end,
                        Rule.DUPLICATE_LICENSE_COMMENT_STRING,
                        this.ruleName,
                        Lint.Replacement.deleteFromTo(badComment.pos, badComment.end)
                    ));
            }

                // Now we only have to check the first comment for validity
            const checkComment = passingComments[0];

                // Header comment must be first of the file.
            if (checkComment.pos !== offset) {
                // @TODO prevent multiple new lines from being added
                failures.push(new Lint.RuleFailure(
                    sourceFile,
                    checkComment.pos,
                    checkComment.end,
                    Rule.INVALID_LICENCE_LOCATION_STRING,
                    this.ruleName,
                    [
                        Lint.Replacement.deleteFromTo(checkComment.pos, checkComment.end),
                        Lint.Replacement.appendText(offset, headerCommentFormat)
                    ]
                ));
            } else if (text.substring(checkComment.pos, checkComment.end) !== headerCommentFormat.trim()) {
                    // Ensure that the license text of the first valid comment matches
                    // what we would place there dynamically. This is where we handle
                    // a case where the comment starting with /*! didn't match the loaded file.
                    // Also catches when a comment has /* and the license, we will flag the missing !
                failures.push(new Lint.RuleFailure(
                    sourceFile,
                    checkComment.pos,
                    checkComment.end,
                    Rule.INVALID_LICENSE_TEXT_STRING,
                    this.ruleName,
                    [
                        Lint.Replacement.deleteFromTo(checkComment.pos, checkComment.end),
                        Lint.Replacement.appendText(offset, headerCommentFormat)
                    ]
                ));
            }
        }
        return failures;
    }

    /**
     * Generates the proper line ending for a source file.
     *
     * @param sourceFile Source file passed by tslint.
     *
     * @returns The line ending character
     */
    private _generateLineEnding(sourceFile: ts.SourceFile) {
        const maybeCarriageReturn =
            sourceFile.text[sourceFile.getLineEndOfPosition(0)] === "\r" ? "\r" : "";

        return `${maybeCarriageReturn}\n`;
    }

    /**
     * Get block comments within a source file.
     * @param sourceFile Source file passed by tslint.
     * @param text Text of the source file.
     *
     * @returns Comments present with in the source file
     */
    private _getComments(sourceFile: ts.SourceFile, text: string): ts.CommentRange[] {
        return ts.forEachChild(sourceFile, this._walkTree.bind(this, text));
    }

    /**
     * Get the header comment for the license loaded.
     * @param sourceFile Source file passed by tslint.
     * @returns The exact header comment to place in the file.
     */
    private _getHeaderComment(sourceFile: ts.SourceFile) {
        const lineEnding = this._generateLineEnding(sourceFile);
        return (
            [
                "/*!",
                // split on both types of line endings in case users just typed "\n" in their configs
                // but are working in files with \r\n line endings
                // Trim trailing spaces to play nice with `no-trailing-whitespace` rule
                ...this.headingContents.split(/\r?\n/g).map((line) => ` * ${line}`.replace(/\s+$/, "")),
                " */",
            ].join(lineEnding) +
            lineEnding
        );
    }

    /**
     * Walk the tree in search of comments.
     *
     * @param text The tree text.
     * @param node The current node.
     *
     * @returns The comments for the given node and all it's children.
     */
    private _walkTree(text: string, node: ts.Node): ts.CommentRange[] {
        const comments = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];

        ts.forEachChild(node, this._walkTree.bind(this, text));
        return comments.concat(ts.forEachChild(node, this._walkTree.bind(this, text)));
    }
}

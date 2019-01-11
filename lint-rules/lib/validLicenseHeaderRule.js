"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
const fs = require("fs");
/**
 * This rule ensures that a license header file is honored in TypeScript and JavaScript
 * files.
 */
class Rule extends Lint.Rules.AbstractRule {
    constructor(options) {
        super(options);
        // Define the contents to write
        this.headingContents = fs.readFileSync(this.ruleArguments[0]).toString();
        // Define the regular expression to match
        const fileLines = this.headingContents.split("\n");
        let regexString = "";
        for (const line of fileLines) {
            regexString += `${line.trim()}[\\S\\s]*`;
        }
        regexString += "\\n\\s*\\*\\/";
        this.headingRegExp = new RegExp(regexString);
    }
    /**
     * Called by tslint to as the rule parser.
     *
     * @param sourceFile Source file passed by tslint
     * @returns An array of failures.
     */
    apply(sourceFile) {
        const failures = [];
        const { text } = sourceFile;
        // ignore shebang if it exists
        const offset = text.startsWith("#!") ? text.indexOf("\n") : 0;
        const headerCommentFormat = this._getHeaderComment(sourceFile);
        // First get all the comments available in the file. We do this to ensure
        // that no duplication exists.
        const comments = this._getComments(sourceFile, text);
        // Next we will filter out those comments that do not match our file
        // input.
        const passingComments = [];
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
            failures.push(new Lint.RuleFailure(sourceFile, offset, offset, Rule.MISSING_HEADER_FAILURE_STRING, this.ruleName, [
                this._trimLeadingBlanks(text, offset),
                Lint.Replacement.appendText(offset, headerCommentFormat)
            ]));
        }
        else {
            // For every comment after the first license one, mark it as an error
            // with the fix to remove the duplicate.
            for (let i = 1; i < passingComments.length; i++) {
                const badComment = passingComments[i];
                const regex = new RegExp(`[\\S\\s]{${badComment.end}}(\\s*)`, "m");
                const endLen = regex.exec(text)[1].length;
                failures.push(new Lint.RuleFailure(sourceFile, badComment.pos, badComment.end, Rule.DUPLICATE_LICENSE_COMMENT_STRING, this.ruleName, Lint.Replacement.deleteFromTo(badComment.pos, badComment.end + endLen)));
            }
            // Now we only have to check the first comment for validity
            const checkComment = passingComments[0];
            // Header comment must be first of the file.
            if (checkComment.pos !== offset) {
                failures.push(new Lint.RuleFailure(sourceFile, checkComment.pos, checkComment.end, Rule.INVALID_LICENCE_LOCATION_STRING, this.ruleName, [
                    this._trimLeadingBlanks(text, offset),
                    Lint.Replacement.deleteFromTo(checkComment.pos, checkComment.end + 2),
                    Lint.Replacement.appendText(offset, headerCommentFormat)
                ]));
            }
            else if (text.substring(checkComment.pos, checkComment.end) !== headerCommentFormat.trim()) {
                const regex = new RegExp(`[\\S\\s]{${checkComment.end}}(\\s*)`, "m");
                const endLen = regex.exec(text)[1].length;
                // Ensure that the license text of the first valid comment matches
                // what we would place there dynamically. This is where we handle
                // a case where the comment starting with /*! didn't match the loaded file.
                // Also catches when a comment has /* and the license, we will flag the missing !
                failures.push(new Lint.RuleFailure(sourceFile, checkComment.pos, checkComment.end, Rule.INVALID_LICENSE_TEXT_STRING, this.ruleName, [
                    Lint.Replacement.deleteFromTo(checkComment.pos, checkComment.end + endLen),
                    Lint.Replacement.appendText(offset, headerCommentFormat)
                ]));
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
    _generateLineEnding(sourceFile) {
        const maybeCarriageReturn = sourceFile.text[sourceFile.getLineEndOfPosition(0)] === "\r" ? "\r" : "";
        return `${maybeCarriageReturn}\n`;
    }
    /**
     * Get block comments within a source file.
     * @param sourceFile Source file passed by tslint.
     * @param text Text of the source file.
     *
     * @returns Comments present with in the source file
     */
    _getComments(sourceFile, text) {
        return this._walkTree(text, sourceFile).filter(
        // Filter out duplicate start positions after finished walking
        (value, index, self) => index === self.findIndex((firstObject) => firstObject.pos === value.pos));
    }
    /**
     * Get the header comment for the license loaded.
     * @param sourceFile Source file passed by tslint.
     * @returns The exact header comment to place in the file.
     */
    _getHeaderComment(sourceFile) {
        const lineEnding = this._generateLineEnding(sourceFile);
        return ([
            "/*!",
            // split on both types of line endings in case users just typed "\n" in their configs
            // but are working in files with \r\n line endings
            // Trim trailing spaces to play nice with `no-trailing-whitespace` rule
            ...this.headingContents.split(/\r?\n/g).map((line) => ` * ${line}`.replace(/\s+$/, "")),
            " */",
        ].join(lineEnding) +
            lineEnding.repeat(2));
    }
    /**
     * Trims leading blanks before creating a comment.
     *
     * @param text The text to trim
     * @param offset The offset accounting for the shebang
     *
     * @returns The delete method that will take place
     */
    _trimLeadingBlanks(text, offset) {
        // Cheap way of getting the starting blank lines minus the shebang present
        // by just using js trim functions.
        const replaceRange = text.substring(offset);
        const newRange = replaceRange.trimLeft();
        return Lint.Replacement.deleteFromTo(offset, replaceRange.length - newRange.length - 1);
    }
    /**
     * Walk the tree in search of comments.
     *
     * @param text The tree text.
     * @param node The current node.
     *
     * @returns The comments for the given node and all it's children.
     */
    _walkTree(text, node) {
        const children = node.getChildren();
        let comments = [];
        for (const child of children) {
            comments = comments.concat(ts.getLeadingCommentRanges(text, child.getFullStart()) || [], this._walkTree(text, child));
        }
        return comments;
    }
}
/**
 * Error string for when more than one license comment was detected.
 */
Rule.DUPLICATE_LICENSE_COMMENT_STRING = "duplicate license comment";
/**
 * Error string for when the license comment is not the first line of the file.
 */
Rule.INVALID_LICENCE_LOCATION_STRING = "license comment must be first line of file";
/**
 * Error string for when the license comment does not match what should be there.
 */
Rule.INVALID_LICENSE_TEXT_STRING = "license text does not match loaded license";
/* tslint:disable:object-literal-sort-keys */
/**
 * Metadata for tslint
 */
Rule.metadata = {
    ruleName: "valid-license-header",
    description: "Enforces a certain header comment for all files, matched by the contents of a license header file.",
    optionsDescription: Lint.Utils.dedent `
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
Rule.MISSING_HEADER_FAILURE_STRING = "missing file header";
/**
 * Error string for when the header does not have a new line immediately after it.
 */
Rule.MISSING_NEW_LINE_FAILURE_STRING = "missing new line following the file header";
exports.Rule = Rule;

"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const Lint = require("tslint");
const fs = require("fs");
class Rule extends Lint.Rules.AbstractRule {
    constructor(options) {
        super(options);
        // Define the contents to write
        this.headingContents = fs.readFileSync(this.ruleArguments[0]).toString();
        // Define the regular expression to match
        const fileLines = this.headingContents.split("\n");
        let regexString = "";
        for (const line of fileLines) {
            regexString += `${line}.*`;
        }
        regexString += "\\n\\s*\\*\\/";
        this.headingRegExp = new RegExp(regexString, "s");
    }
    apply(sourceFile) {
        const failures = [];
        const { text } = sourceFile;
        const headerFormat = this.headingRegExp;
        const textToInsert = this.headingContents;
        // ignore shebang if it exists
        let offset = text.startsWith("#!") ? text.indexOf("\n") : 0;
        // returns the text of the first comment or undefined
        const commentText = ts.forEachLeadingCommentRange(text, offset, (pos, end, kind) => text.substring(pos + 2, kind === ts.SyntaxKind.SingleLineCommentTrivia ? end : end - 2));
        if (sourceFile.fileName.indexOf("Environment.ts") !== -1) {
            const headerCommentFormat = this.getHeaderComment(sourceFile);
            // First get all the comments available in the file. We do this to ensure
            // that no duplication exists.
            let comments = [];
            const concatComments = (node) => {
                const commentRange = ts.getLeadingCommentRanges(text, node.getFullStart());
                if (commentRange !== undefined) {
                    comments = comments.concat(commentRange);
                }
            };
            ts.forEachChild(sourceFile, concatComments);
            // Next we will filter out those comments that do not match our file
            // input.
            const passingComments = [];
            // @TODO add /*! regardless of if the heading matches
            for (const comment of comments) {
                const commentContent = text.substring(comment.pos, comment.end);
                // Verify that the range matches
                if (/^\/\*\!/.test(commentContent) || this.headingRegExp.test(commentContent)) {
                    passingComments.push(comment);
                }
            }
            console.log(passingComments);
            // Check that we had at least one possible valid comment.
            // If there were none, the fix is to just create it at the start.
            if (passingComments.length <= 0) {
                failures.push(new Lint.RuleFailure(sourceFile, offset, offset, Rule.MISSING_HEADER_FAILURE_STRING, this.ruleName, [
                    Lint.Replacement.appendText(offset, headerCommentFormat)
                ]));
            }
            else {
                // For every comment after the first license one, mark it as an error
                // with the fix to remove the duplicate.
                for (let i = 1; i < passingComments.length; i++) {
                    const badComment = passingComments[i];
                    failures.push(new Lint.RuleFailure(sourceFile, badComment.pos, badComment.end, Rule.DUPLICATE_LICENSE_COMMENT_STRING, this.ruleName, [
                        Lint.Replacement.deleteFromTo(badComment.pos, badComment.end)
                    ]));
                }
                // Now we only have to check the
            }
            return failures;
            // console.log();
            // console.log(comments);
            // // const cb = (node: ts.Node): void => {
            // //     console.log("here");
            // //     console.log(node.getText());
            // //     if (node.kind === ts.SyntaxKind.JSDocComment) {
            // //         console.log(node);
            // //     } else {
            // //         return ts.forEachChild(node, cb);
            // //     }
            // // };
            // // ts.forEachChild(sourceFile, cb);
            // const range = ts.getLeadingCommentRanges(text, 0)[0];
            // console.log(range);
            // if (range.pos !== 0) {
            //     const fix = [
            //         Lint.Replacement.deleteFromTo(range.pos, range.end),
            //         Lint.Replacement.appendText(
            //             offset,
            //             this.createComment(
            //                 sourceFile,
            //                 textToInsert,
            //                 0,
            //                 1
            //             ))
            //     ];
            //     failures.push(
            //         new Lint.RuleFailure(
            //             sourceFile,
            //             range.pos,
            //             range.end,
            //             "COMMENT NOT AT START",
            //             this.ruleName,
            //             fix
            //         )
            //     );
            //     return failures;
            // }
        }
        if (commentText === undefined || !headerFormat.test(commentText)) {
            const isErrorAtStart = offset === 0;
            if (!isErrorAtStart) {
                ++offset; // show warning in next line after shebang
            }
            const leadingNewlines = isErrorAtStart ? 0 : 1;
            const trailingNewlines = isErrorAtStart ? 2 : 1;
            const fix = textToInsert !== undefined
                ? Lint.Replacement.appendText(offset, this.createComment(sourceFile, textToInsert, leadingNewlines, trailingNewlines))
                : undefined;
            return [
                new Lint.RuleFailure(sourceFile, offset, offset, Rule.MISSING_HEADER_FAILURE_STRING, this.ruleName, fix),
            ];
        }
        // const trailingNewLineViolation =
        //     enforceExtraTrailingLine &&
        //     headerFormat.test(commentText) &&
        //     this.doesNewLineEndingViolationExist(text, offset);
        // if (true) {
        //     const trailingCommentRanges = ts.getTrailingCommentRanges(text, offset);
        //     const endOfComment = trailingCommentRanges![0].end;
        //     const lineEnding = this.generateLineEnding(sourceFile);
        //     console.log(sourceFile.fileName);
        //     console.log(trailingCommentRanges);
        //     const fix =
        //         textToInsert !== undefined
        //             ? Lint.Replacement.appendText(endOfComment, lineEnding)
        //             : undefined;
        //     return [
        //         new Lint.RuleFailure(
        //             sourceFile,
        //             offset,
        //             offset,
        //             Rule.MISSING_NEW_LINE_FAILURE_STRING,
        //             this.ruleName,
        //             fix,
        //         ),
        //     ];
        // }
        if (this.doesLicenseIndicatorViolationExist(text, offset)) {
            return [
                new Lint.RuleFailure(sourceFile, offset, offset, "TEST", this.ruleName)
            ];
        }
        return [];
    }
    createComment(sourceFile, commentText, leadingNewlines = 1, trailingNewlines = 1) {
        const lineEnding = this.generateLineEnding(sourceFile);
        return (lineEnding.repeat(leadingNewlines) +
            [
                "/*!",
                // split on both types of line endings in case users just typed "\n" in their configs
                // but are working in files with \r\n line endings
                // Trim trailing spaces to play nice with `no-trailing-whitespace` rule
                ...commentText.split(/\r?\n/g).map((line) => ` * ${line}`.replace(/\s+$/, "")),
                " */",
            ].join(lineEnding) +
            lineEnding.repeat(trailingNewlines));
    }
    doesLicenseIndicatorViolationExist(text, offset) {
        const entireComment = ts.forEachLeadingCommentRange(text, offset, (pos, end) => text.substring(pos, end + 2));
        return entireComment !== undefined && !/^\/\*\!/.test(entireComment);
    }
    // private doesNotStartingCommentViolationExist() {
    // }
    generateLineEnding(sourceFile) {
        const maybeCarriageReturn = sourceFile.text[sourceFile.getLineEndOfPosition(0)] === "\r" ? "\r" : "";
        return `${maybeCarriageReturn}\n`;
    }
    getHeaderComment(sourceFile) {
        const lineEnding = this.generateLineEnding(sourceFile);
        return ([
            "/*!",
            // split on both types of line endings in case users just typed "\n" in their configs
            // but are working in files with \r\n line endings
            // Trim trailing spaces to play nice with `no-trailing-whitespace` rule
            ...this.headingContents.split(/\r?\n/g).map((line) => ` * ${line}`.replace(/\s+$/, "")),
            " */",
        ].join(lineEnding) +
            lineEnding);
    }
}
Rule.DUPLICATE_LICENSE_COMMENT_STRING = "duplicate license comment";
/* tslint:disable:object-literal-sort-keys */
Rule.metadata = {
    ruleName: "valid-license-header",
    description: "Enforces a certain header comment for all files, matched by a regular expression.",
    optionsDescription: Lint.Utils.dedent `
            The first option, which is mandatory, is a regular expression that all headers should match.`,
    options: {
        type: "array",
        items: [
            {
                type: "string",
            }
        ],
        additionalItems: false,
        minLength: 1,
        maxLength: 2,
    },
    optionExamples: [[true, "HEADER_FILE"]],
    hasFix: true,
    type: "style",
    typescriptOnly: false,
};
/* tslint:enable:object-literal-sort-keys */
Rule.MISSING_HEADER_FAILURE_STRING = "missing file header";
Rule.MISSING_NEW_LINE_FAILURE_STRING = "missing new line following the file header";
exports.Rule = Rule;

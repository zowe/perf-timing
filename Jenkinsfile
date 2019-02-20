/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

@Library('shared-pipelines@v1.0.1') import org.zowe.pipelines.nodejs.NodeJSPipeline

import org.zowe.pipelines.nodejs.models.SemverLevel

node('ca-jenkins-agent') {
    // Initialize the pipeline
    def pipeline = new NodeJSPipeline(this)

    // Build admins, users that can approve the build and receieve emails for 
    // all protected branch builds.
    pipeline.admins.add("wrich04", "zfernand0", "mikebauerca", "markackert", "dkelosky")

    // Protected branch property definitions
    pipeline.protectedBranches.addMap([
        [name: "master", tag: "daily", prerelease: "alpha"],
        [name: "beta", tag: "beta", prerelease: "beta"],
        [name: "latest", tag: "latest"],
        [name: "lts-incremental", tag: "lts-incremental", level: SemverLevel.MINOR],
        [name: "lts-stable", tag: "lts-stable", level: SemverLevel.PATCH]
    ])

    // Git configuration information
    pipeline.gitConfig = [
        email: 'zowe.robot@gmail.com',
        credentialsId: 'zowe-robot-github'
    ]

    // npm publish configuration
    pipeline.publishConfig = [
        email: pipeline.gitConfig.email,
        credentialsId: 'GizaArtifactory'
    ]

    // Initialize the pipeline library, should create 5 steps
    pipeline.setup()

    // Create a custom lint stage that runs immediately after the setup.
    pipeline.createStage(
        name: "Lint",
        stage: {
            sh "npm run lint"
        },
        timeout: [
            time: 2,
            unit: 'MINUTES'
        ]
    )

    // Build the application
    pipeline.build(timeout: [
        time: 5,
        unit: 'MINUTES'
    ])

    def UNIT_TEST_ROOT = "__tests__/__results__/unit"
    
    // Perform a unit test and capture the results
    pipeline.test(
        name: "Unit",
        operation: {
            sh "npm run test:unit"
        },
        testResults: [dir: "${UNIT_TEST_ROOT}/html", files: "index.html", name: "Perf Timing: Unit Test Report"],
        coverageResults: [dir: "${UNIT_TEST_ROOT}/coverage/lcov-report", files: "index.html", name: "Perf Timing: Code Coverage Report"],
        junitOutput: "${UNIT_TEST_ROOT}/junit/junit.xml",
        cobertura: [
            coberturaReportFile: "${UNIT_TEST_ROOT}/coverage/cobertura-coverage.xml"
        ]
    )

    // Custom stage to generate the typedoc output, this will only run for a protected
    // branch as long as the build is still successful.
    pipeline.createStage(
        name: "Generate Typedoc",
        shouldExecute: {
            // Only execute the doc generation when the branch is protected
            return pipeline.protectedBranches.isProtected(BRANCH_NAME)
        },
        timeout: [time: 5, unit: 'MINUTES'],
        stage: {
           echo "Building documentation"
           sh "npm run doc"
           sh "git add README.md ./docs/typedoc"
           pipeline.gitCommit("Autogenerate Typedoc")
        }
    )

    // Deploys the application if on a protected branch. Give the version input
    // 30 minutes before an auto timeout approve.
    pipeline.deploy(
        versionArguments: [timeout: [time: 30, unit: 'MINUTES']]
    )

    // Once called, no stages can be added and all added stages will be executed. On completion
    // appropriate emails will be sent out by the shared library.
    pipeline.end()
}

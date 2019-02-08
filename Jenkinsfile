@Library('shared-pipelines@zowe/zowe-cli/142') import org.zowe.pipelines.nodejs.NodeJSPipeline

import org.zowe.pipelines.nodejs.models.SemverLevel

node('ca-jenkins-agent') {
    def nodejs = new NodeJSPipeline(this)

    // Build admins, users that can approve the build and receieve emails for 
    // all protected branch builds
    nodejs.admins.add("wrich04", "zfernand0", "mikebauerca", "markackert", "dkelosky")

    // Protected branch property definitions
    nodejs.protectedBranches.addListMap([
        [name: "master", tag: "daily", prerelease: "alpha"],
        [name: "beta", tag: "beta", prerelease: "beta"],
        [name: "latest", tag: "latest"],
        [name: "lts-incremental", tag: "lts-incremental", level: SemverLevel.MINOR],
        [name: "lts-stable", tag: "lts-stable", level: SemverLevel.PATCH]
    ])

    // Git configuration information
    nodejs.gitConfig = [
        email: 'zowe.robot@gmail.com',
        credentialsId: 'zowe-robot-github'
    ]

    // npm publish configuration
    nodejs.publishConfig = [
        email: nodejs.gitConfig.email,
        credentialsId: 'GizaArtifactory'
    ]

    // Initialize the pipeline library, should create 5 steps
    nodejs.setup()

    // Create a custom lint stage that runs immediately after the setup.
    nodejs.createStage(
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
    nodejs.build(timeout: [
        time: 5,
        unit: 'MINUTES'
    ])

    def UNIT_TEST_ROOT = "__tests__/__results__/unit"
    
    // Perform a unit test and capture the results
    nodejs.test(
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
    nodejs.createStage(
        name: "Generate Typedoc",
        shouldExecute: {
            // Only execute the doc generation when the branch is protected
            return nodejs.protectedBranches.isProtected(BRANCH_NAME)
        },
        timeout: [time: 5, unit: 'MINUTES'],
        stage: {
           echo "Building documentation"
           sh "npm run doc"
           sh "git add README.md ./docs/typedoc"
           nodejs.gitCommit("Autogenerate Typedoc")
        }
    )

    // Deploys the application if on a protected branch. Give the version input
    // 30 minutes before an auto timeout approve.
    nodejs.deploy(
        versionArguments: [timeout: [time: 30, unit: 'MINUTES']]
    )

    // Once called, no stages can be added and all added stages will be executed. On completion
    // appropriate emails will be sent out by the shared library.
    nodejs.end()
}

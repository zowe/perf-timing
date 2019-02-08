@Library('shared-pipelines@zowe/zowe-cli/142') import org.zowe.pipelines.nodejs.NodeJSPipeline

import org.zowe.pipelines.nodejs.models.SemverLevel

node('ca-jenkins-agent') {
    def nodejs = new NodeJSPipeline(this)

    // nodejs.adminEmails = [
    //     "christopher.wright@broadcom.com"
    //     // "fernando.rijocedeno@broadcom.com",
    //     // "michael.bauer2@broadcom.com",
    //     // "mark.ackert@broadcom.com",
    //     // "daniel.kelosky@broadcom.com"
    // ]

    nodejs.admins.add("wrich04", "zfernand0")

    nodejs.protectedBranches.addListMap([
        [name: "master", tag: "daily", prerelease: "alpha"],
        [name: "beta", tag: "beta", prerelease: "beta"],
        [name: "latest", tag: "latest"],
        [name: "lts-incremental", tag: "lts-incremental", level: SemverLevel.MINOR],
        [name: "lts-stable", tag: "lts-stable", level: SemverLevel.PATCH]
    ])

    nodejs.gitConfig = [
        user: 'zowe-robot',
        email: 'zowe.robot@gmail.com',
        credentialsId: 'zowe-robot-github'
    ]

    nodejs.publishConfig = [
        email: nodejs.gitConfig.email,
        credentialsId: 'GizaArtifactory'
    ]

    nodejs.setup()

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

    nodejs.build(timeout: [
        time: 5,
        unit: 'MINUTES'
    ])

    def UNIT_TEST_ROOT = "__tests__/__results__/unit"
    
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

    nodejs.deploy(
        versionArguments: [timeout: [time: 30, unit: 'MINUTES']]
    )

    // Test

    nodejs.end()
}

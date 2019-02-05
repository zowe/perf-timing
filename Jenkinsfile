@Library('shared-pipelines@zowe/zowe-cli/142') import org.zowe.pipelines.nodejs.NodeJSPipeline

node('ca-jenkins-agent') {
    def nodejs = new NodeJSPipeline(this)

    nodejs.adminEmails = [
        "christopher.wright@broadcom.com"
        // "fernando.rijocedeno@broadcom.com",
        // "michael.bauer2@broadcom.com",
        // "mark.ackert@broadcom.com",
        // "daniel.kelosky@broadcom.com"
    ]

    nodejs.protectedBranches.addListMap([
        [name: "master", tag: "daily"],
        [name: "beta", tag: "beta"],
        [name: "latest", tag: "beta"],
        [
            name: "zowe/zowe-cli/142",
            tag: "testing-deploy"
        ]
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
        testOperation: {
            sh "npm run test:unit"
        },
        testResults: [dir: "${UNIT_TEST_ROOT}/html", files: "index.html", name: "Perf Timing: Unit Test Report"],
        coverageResults: [dir: "${UNIT_TEST_ROOT}/coverage/lcov-report", files: "index.html", name: "Perf Timing: Code Coverage Report"],
        junitOutput: "${UNIT_TEST_ROOT}/junit/junit.xml",
        cobertura: [
            coberturaReportFile: "${UNIT_TEST_ROOT}/coverage/cobertura-coverage.xml"
        ]
    )

    nodejs.deploy()

    nodejs.end()
}

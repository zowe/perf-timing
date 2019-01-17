@Library('shared-pipelines@zowe/zowe-cli/139_declarative-to-scripted') import org.zowe.pipelines.NodeJS

node('ca-jenkins-agent') {
    def nodejs = new NodeJS(this)

    nodejs.adminEmails = [
        "christopher.wright@broadcom.com",
        // "fernando.rijocedeno@broadcom.com",
        // "michael.bauer2@broadcom.com",
        // "mark.ackert@broadcom.com",
        // "daniel.kelosky@broadcom.com"
    ]

    nodejs.protectedBranches = [
        master: 'daily'
    ]

    nodejs.gitConfig = [
        user: 'zowe-robot',
        email: 'zowe.robot@gmail.com',
        credentialId: 'zowe-robot-github'
    ]

    nodejs.publishConfig = [
        email: nodejs.gitConfig.email,
        credentialId: 'GizaArtifactory'
    ]

    nodejs.setup()

    nodejs.createStage(name: "Lint", stage: {
        sh "npm run lint"
    })

    nodejs.buildStage()
    
    nodejs.testStage(name: "Unit", testOperation: {
        sh "npm run test:unit"
    })

    nodejs.end()
}

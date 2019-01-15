@Library('shared-pipelines@email_notify') import org.zowe.pipelines.NodeJS

node('ca-jenkins-agent') {
    def nodejs = new NodeJS(this)

    nodejs.adminEmails = [
        // "christopher.wright@broadcom.com",
        // "fernando.rijocedeno@broadcom.com",
        "christopher.boehm@broadcom.com" //,
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

    nodejs.createStage(name: "lint", stage: {
        sh "npm run lint"
    })

    nodejs.buildStage()
    nodejs.testStage()
}

@Library('shared-pipelines@zowe/zowe-cli/139_declarative-to-scripted') import org.zowe.pipelines.NodeJS

node('ca-jenkins-agent') {
    def nodejs = new NodeJS(this)

    nodejs.adminEmails = [
        "christopher.wright@broadcom.com",
        "fernando.rijocedeno@broadcom.com",
        "michael.bauer2@broadcom.com",
        "mark.ackert@broadcom.com",
        "daniel.kelosky@broadcom.com"
    ]

    nodejs.protectedBranches = [
        master: 'daily'
    ]

    nodejs.setup()
}
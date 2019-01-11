@Library('shared-pipelines@zowe/zowe-cli/139_declarative-to-scripted') import org.zowe.pipelines.NodeJS

node('ca-jenkins-agent') {
    def nodejs = new NodeJS(this)
    nodejs.setup()
}
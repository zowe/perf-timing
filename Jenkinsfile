@Library('shared-pipelines@zowe/zowe-cli/139_declarative-to-scripted') import org.zowe.pipelines.NodeJS

node('ca-jenkins-agent') {
    def nodejs = new NodeJS(this)
    nodejs.setup('this is a test string')
    nodejs.setup2('what am I doing')

    stage('setup 3') {
        echo "this will do something..."
        sh "ls -al"
    }
}
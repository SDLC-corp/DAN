pipeline {
    agent any
    options {
        skipStagesAfterUnstable()
        disableRestartFromStage()
    }
    tools {
        nodejs "nodejs"
    }
    stages {
        stage('install') {
            when {
                anyOf{
                    expression{env.BRANCH_NAME == 'deploy'}
                    expression{env.BRANCH_NAME == 'deploy-prod'}
                }
            }
            steps {
                sh 'npm install'
            }
        }

        stage('create-env-dev') {
            when {
                branch 'deploy'
            }
            environment {
                VITE_API_URL = credentials("TWRPA_WEB_QA_VITE_API_URL")
                BRANCH_NAME = '${env.BRANCH_NAME}'
            }
            steps {
                echo 'Creating Enviorment varibles : '+env.BRANCH_NAME
                sh '''#!/bin/bash
                touch .env
                echo VITE_API_URL=$VITE_API_URL >> .env
                '''
            }
        }

        stage('deploy-dev') {
            when {
                branch 'deploy'
            }
            environment {
                TWRPA_WEB_QA_IP = credentials("TWRPA_WEB_QA_IP")
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: "jenkins-ssl", keyFileVariable: 'sshkey')
                ]) {
                    echo 'deploying the software'
                    sh '''#!/bin/bash
                    echo "Creating .ssh"
                    mkdir -p /var/lib/jenkins/.ssh
                    echo "Starting Build"
                    npm run build
                    echo "Build Completed"
                    ssh-keyscan ${TWRPA_WEB_QA_IP} >> /var/lib/jenkins/.ssh/known_hosts
                    echo "ssh-keyscan done"
                    ssh -i $sshkey deployer@${TWRPA_WEB_QA_IP} "mkdir -p /home/deployer/repo/transworld-rpa-web/$BRANCH_NAME"
                    echo "directiry created"
                    rsync -avz --exclude  '.git' --delete -e "ssh -i $sshkey" ./dist deployer@${TWRPA_WEB_QA_IP}:/home/deployer/repo/transworld-rpa-web/$BRANCH_NAME
                    echo "data moved"

                    '''
                }
            }
        }

        stage('create-env-prod') {
            when {
                branch 'deploy-prod'
            }
            environment {
                VITE_API_URL = credentials("TWRPA_WEB_PROD_VITE_API_URL")
                BRANCH_NAME = '${env.BRANCH_NAME}'
            }
            steps {
                echo 'Creating Enviorment varibles : '+env.BRANCH_NAME
                sh '''#!/bin/bash
                touch .env
                echo VITE_API_URL=$VITE_API_URL >> .env
                '''
            }
        }

        stage('deploy-prod') {
            when {
                branch 'deploy-prod'
            }
            environment {
                TWRPA_WEB_PROD_IP = credentials("TWRPA_WEB_PROD_IP")
            }
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: "jenkins-ssl", keyFileVariable: 'sshkey')
                ]) {
                    echo 'deploying the software'
                    sh '''#!/bin/bash
                    echo "Creating .ssh"
                    mkdir -p /var/lib/jenkins/.ssh
                    echo "Starting Build"
                    npm run build
                    echo "Build Completed"
                    ssh-keyscan ${TWRPA_WEB_PROD_IP} >> /var/lib/jenkins/.ssh/known_hosts
                    echo "ssh-keyscan done"
                    ssh -i $sshkey deployer@${TWRPA_WEB_PROD_IP} "mkdir -p /home/deployer/repo/transworld-rpa-web/$BRANCH_NAME"
                    echo "directiry created"
                    rsync -avz --exclude  '.git' --delete -e "ssh -i $sshkey" ./dist deployer@${TWRPA_WEB_PROD_IP}:/home/deployer/repo/transworld-rpa-web/$BRANCH_NAME
                    echo "data moved"

                    '''
                }
            }
        }
    }
}
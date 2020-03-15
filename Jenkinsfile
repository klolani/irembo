#!groovy
//I have defined here 2 containers,
//1. tools; my jenkins slave to build and push the builds to ECR registry
//2. deploy; has helm installed and configured to install my helm charts
pipeline {
    agent {
        kubernetes {
            label "build-${BUILD_NUMBER}"
            defaultContainer 'jnlp'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: "build-${BUILD_NUMBER}"
spec:
  containers:
  - name: tools
    image: xxxxxxxxxx.dkr.ecr.us-west-2.amazonaws.com/devops/jenkins-slave:v1.0
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-socket
  - name: deploy
    image: xxxxxxxxxx.dkr.ecr.us-west-2.amazonaws.com/devops/kubectl_helm:xxxxxxx
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-socket
  volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
      type: File
"""
        }
    }
    stages {
        //checkout our git branch
        stage('Checkout'){
            steps {
                checkout scm
            }
        }
       //build our nodejs app
        stage('Build nodejs app') {
            steps {
                container('tools') {
                    sh "env"
                    sh "docker build -t hello-world . "
                }
            }
        }
        //Login to ECR registry
        stage('Login to ECR'){
            steps{
                container('tools') {
                    sh '$(aws ecr get-login --no-include-email --region us-west-2)'
                }
            }
        }
        //we define our ECR registry, my docker container above already has the credentials defined
        stage('Push Docker image to ECR'){
            steps{
                container('tools') {
                    sh "docker tag hello-world:latest xxxxxxxxxx.dkr.ecr.us-west-2.amazonaws.com/hello-world:${BRANCH_NAME}-${GIT_COMMIT.take(10)}"
                    sh "docker push xxxxxxxxxx.dkr.ecr.us-west-2.amazonaws.com/hello-world:${BRANCH_NAME}-${GIT_COMMIT.take(10)}"
                }
            }
        }
        //Install app helm chart
        stage('Deploy service'){
            steps {
                container('deploy') {
                    sh "helm repo update"
                    sh "helm search hello-world"
                    //deploy application based on the environment and branch e.g branch dev, deploy on dev cluster in dev namespace
                    script {
                        switch (env.BRANCH_NAME) {
                            case 'dev':
                                sh "helm upgrade -i --debug  hello-world hello-world" +
                                        "--set image.tag=${BRANCH_NAME}-${GIT_COMMIT.take(10)} "
                                        "--namespace=dev"
                                sh "kubectl rollout status deployment/hello-world -n dev"
                                break
                            case 'qa':
                                sh 'kubectl config use-context dev.k8s.local'
                                sh "helm upgrade -i --debug  hello-world hello-world" +
                                        "--set image.tag=${BRANCH_NAME}-${GIT_COMMIT.take(10)} " +
                                        "--namespace=qa"
                                sh "kubectl rollout status deployment/hello-world -n qa"
                                break
                            //prod releases can be managed better with Argocd but will have them here for demo purposes
                            case 'master':
                                sh 'kubectl config use-context prod.k8s.local'
                                sh "helm upgrade -i --debug  hello-world hello-world" +
                                        "--set image.tag=${BRANCH_NAME}-${GIT_COMMIT.take(10)} " +
                                        "--namespace=prod"
                                sh "kubectl rollout status deployment/hello-world -n prod"
                                break
                            //for each pull request, deploy the application on dev cluster for test purposes only
                            case ~/^PR-\d+$/:
                                sh 'kubectl config use-context dev.k8s.local'
                                sh "helm upgrade -i --debug  hello-world hello-world" +
                                        "--set image.tag=${BRANCH_NAME}-${GIT_COMMIT.take(10)} " +
                                        "--namespace=dev"
                                sh "kubectl rollout status deployment/hello-world -n dev"

                        }
                    }
                }
            }
        }
    }
//slack notification upon completion of deploy process
    post {
        always {
            container('tools'){
                slack_notify()
            }
        }
    }
}

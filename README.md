# Hello world
[My design document goes here](https://docs.google.com/document/dummy_design_doc

This project runs a simple nodejs app, welcoming you all to Kenn's world

**Key objectives**
* Create a hello world application in any language of your choice and deploy that in a kubernetes cluster you have created using helm chart
* The app should be able to autoscale at 50% of resources
* The app should be able to be accessible in kubernetes DNS
* Deploy the app in deferent namespace than default
* Deploy default redis chart in different namespace
* Explain how would your app connect to it (It does not to actually connect to it you can explain the approach)

### Versioning
This project uses [Semantic Versioning 2.0.0](https://semver.org/) starting with `v1.0.0`.

### Pre-requisite for setting up the project locally

- In order to run this successfully ensure you have the latest Helm (v3.1.2) since some syntax have changes since previous versions
- Helm tiller is working as expected
- Install kubernetes kind depending on your platform e.g `brew install kind` for Mac / Linux via Homebrew:
- Install kubens https://github.com/ahmetb/kubectx/blob/master/kubens to help navigate between namespaces


### Running and testing
We're using Docker and kubernetes to run this project locally
* Install kubernetes kind: `brew install kind`
* create a cluster: `kind create cluster dev`
* Build the nodejs app: `docker build -t  .`
* Load the docker image to kind cluster : `kind load docker-image hello-world:v1.0.0 --name=dev`
* Create namespace to deploy our app: `kubectl create namespace dev`
* Switch to dev namespace: `kubens dev`
* Install the app via Helm chart: `helm install hello-world ./hello-world`
* Check deployment status: `kubectl rollout status hello-world/hello-world`
* Add horizontal pod autoscaler: `kubectl autoscale deployment hello-world --cpu-percent=50 --min=1 --max=10`
* Create a Redis namespace: `kubectl create namespace data`
* Deploy default redis chart in different namespace:
  - `helm repo add bitnami https://charts.bitnami.com/bitnami`
  - `helm install bitnami/redis`
* Confirm pods working as expected: `kubectl get all`

Notes:
* To have the app communicate to the redis deployed;
  - Customize the redis chart before installing and add a unique service name for the redis cluster e.g `redis-db-svc.external.svc`
  - Define as environment variables DB_HOST(the value from above), DB_PORT and DB_PASS on the app's values and pass the values via secretEnv from your secrets manager
  - Application will then load environments upon starting and read the redis config values from the environment variables


##### Understanding the CI/CD Pipeline
- I have added the Jenkinsfile that creates and pushes the image used in helm deployment
- I have defined here 2 containers,
    * tools; my jenkins slave to build and push the builds to ECR registry
    * deploy; has helm installed and configured to install my helm charts

#### Assumptions
- You have a container registry; I'm using AWS ECR registry as my container registry
- You are running your jenkins master and slave as docker containers that are disposable
- You have a define CI/CD workflow on your github branch; dev,qa,stage and master
- Each environment is deployed in its own cluster and namespaces

### Understanding the project
_Prerequisite: General understanding of nodejs_
_General understanding of command line use including kubectl_
_General understanding of command line use including kubectl_
_General understanding of command line use including kubectl_
_General understanding of git_

**The approach and reasons behind my choices**
* App runs on the nodejs base container which has the required nodejs packages installed.
* Used kind for kubernetes since it is less resources intensive compared to minikube
* Jenkinsfile defines 2 extra containers to run build jobs as and when required. The images also contain the necessary credentials to e.g the ECR registry



## Service Maintainers
If you have any questions regarding this project, please reach out to
- Kennedy Wanyangu [GitHub](https://github.com/klolani)

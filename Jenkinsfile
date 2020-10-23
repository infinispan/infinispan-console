#!/usr/bin/env groovy

pipeline {
  agent {
    label 'slave-group-normal'
  }

  options {
    timeout(time: 20, unit: 'MINUTES')
  }

  stages {
    stage('Run server') {
      steps {
        sh './run-server-for-e2e.sh --ci'
      }
    }

    stage('Cleanup') {
      steps{
        step([$class: 'WsCleanup'])
      }
    }

    stage('SCM Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        script {
          def mvnHome = tool 'Maven'
          sh "${mvnHome}/bin/mvn clean install -De2e=true"
        }
      }
    }
  }
  post {
    failure {
      sh 'cat tmp-tests.log'
    }
  }
}

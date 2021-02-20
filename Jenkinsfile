#!/usr/bin/env groovy

pipeline {
  agent {
    label 'slave-group-normal'
  }

  options {
    timeout(time: 20, unit: 'MINUTES')
  }

  stages {
    stage('Cleanup') {
      steps{
        step([$class: 'WsCleanup'])
      }
    }

    stage('Prepare') {
      steps {
        // Show the agent name in the build list
        script {
          // The manager variable requires the Groovy Postbuild plugin
          manager.addShortText(env.NODE_NAME, "grey", "", "0px", "")
        }

        // Workaround for JENKINS-47230
        script {
          env.MAVEN_HOME = tool('Maven')
          env.MAVEN_OPTS = "-Xmx1g -XX:+HeapDumpOnOutOfMemoryError"
          env.JAVA_HOME = tool('JDK 11')
        }

        sh 'cleanup.sh'
      }
    }

    stage('SCM Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Run server') {
      steps {
        sh './run-server-for-e2e.sh --ci'
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

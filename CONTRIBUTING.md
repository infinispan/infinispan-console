# Contributing to Infinispan Console

Thank you for your interest in contributing to Infinispan Console! We value community contributions and appreciate your efforts to improve our project. To ensure a smooth contribution process, please review the following guidelines.

You can access our documentation at [Infinispan Documentation](https://infinispan.org/documentation/).

If you have any questions or need assistance, please feel free to reach out to us via [Zulip chat](https://infinispan.zulipchat.com/).

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up Your Development Environment](#setting-up-your-development-environment)
- [Contributing](#contributing)
  - [Reporting Bugs](#reporting-bugs)
  - [Submitting Enhancements](#submitting-enhancements)
  - [Code Contributions](#code-contributions)
- [Development Guidelines](#development-guidelines)
  - [Coding Standards](#coding-standards)
  - [Commit Message Guidelines](#commit-message-guidelines)
  - [Testing](#testing)

## Getting Started

### Prerequisites

Before you start contributing, make sure you have the following prerequisites installed:

- [Infinispan server](https://github.com/infinispan/infinispan-console/blob/main/README.md#run-with-docker)
- [Node 18 or greater](https://nodejs.org/en)
- [Git](https://git-scm.com/downloads)

### Setting Up Your Development Environment

1. Fork this repository to your GitHub account.
2. Clone your forked repository to your local machine.

   ```sh
   git clone https://github.com/your-username/infinispan-console.git
   ```
3. Navigate to project directory.

    ```sh
    cd infinispan-console 
    ```
4. Installing dependencies:

    ```sh
    npm install
    ```
### Running locally

```sh
npm run start:dev
```
You can access the console at http://localhost:4010. The console will automatically reload when you make changes.

## Contributing

### Reporting Bugs
If you encounter a bug, please open a [GitHub issue](https://github.com/infinispan/infinispan-console/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml&title=%5BBug%5D%3A+) with a clear and detailed description of the problem. Include any relevant error messages and steps to reproduce the issue.

### Submitting Enhancements
We welcome suggestions and enhancements. Please open an [Github issue](https://github.com/infinispan/infinispan-console/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yaml&title=%5BFeature+Request%5D%3A+) to discuss your idea before implementing it. This helps ensure that your work aligns with the project's goals.

### Code Contributions
1. Ensure that your code adheres to the [coding standards](#coding-standards).
2. Create a new branch for your changes:

    ```sh
    git checkout -b branch-name
    ```
3. Commit your changes with clear and concise messages. The commit message must includes a reference to the corresponding JIRA issue (eg. commit message: "ISPN-1234 JIRA TITLE...")
4. Push your branch to your forked repository:

    ```sh
    git push origin feature/your-feature
    ```
5. Submit a pull request (PR) to the main repository.

## Development Guidelines

### Coding Standards
Please format your code using [Prettier](https://prettier.io/) or by running:

```sh
npm run format
```

### Commit Message Guidelines
Follow this format for commit messages: Start with the JIRA issue number, followed by a JIRA/Issue title:

```sh
ISPN-1234 JIRA TITLE...
```

### Testing
Ensure that your code includes unit tests when applicable. All tests should pass before submitting a PR.

#### e2e testing:

1. Run the Infinispan server using `./run-server-for-e2e.sh`, which will download and run the server.
2. Run the following command with the `-De2e=true` flag:
```bash
mvn clean install -De2e=true
```

#### Unit testing:
```bash
npm run test
```
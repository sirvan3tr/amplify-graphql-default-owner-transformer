# @owner directive
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

This `@owner` directive on the GraphQL schema for the AWS Amplify API framework
will force the field to take the IAM user's username.

Whilst the existing framework does some automatic owner addition for you, I have
found it to be buggy and not always work. This is like forcing a field
to take the owner's username.

### Install
#### Yarn
`yarn add graphql-default-owner-transformer `

#### npm
`npm i graphql-default-owner-transformer`

#### Dev
`yarn install`

### How to use
```graphql
type Post @model {
  id: ID!
  message: String
  owner: String @owner
}
```

### Limitations and TODOs:
- Only works with IAM credentials and takes the username.
- Does not check if the credentials exist, it only assumes.

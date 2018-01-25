#!/bin/bash

if [[ $GITHUB_TOKEN ]]; then
    remote=https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG
fi
if [[ $GH_TOKEN ]]; then
    remote=https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG
fi

if ! git push --quiet "$remote" "$TRAVIS_BRANCH" > /dev/null 2>&1; then
    err "failed to push git changes"
    return 1
fi

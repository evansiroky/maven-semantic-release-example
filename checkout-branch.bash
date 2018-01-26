#!/bin/bash
# copied from https://gist.github.com/ddgenome/f3a60fe4c2af0cbe758556d982fbeea9

local head_ref branch_ref
head_ref=$(git rev-parse HEAD)
if [[ $? -ne 0 || ! $head_ref ]]; then
    err "failed to get HEAD reference"
    return 1
fi
branch_ref=$(git rev-parse "$TRAVIS_BRANCH")
if [[ $? -ne 0 || ! $branch_ref ]]; then
    err "failed to get $TRAVIS_BRANCH reference"
    return 1
fi
if [[ $head_ref != $branch_ref ]]; then
    msg "HEAD ref ($head_ref) does not match $TRAVIS_BRANCH ref ($branch_ref)"
    msg "someone may have pushed new commits before this build cloned the repo"
    return 0
fi
if ! git checkout "$TRAVIS_BRANCH"; then
    err "failed to checkout $TRAVIS_BRANCH"
    return 1
fi

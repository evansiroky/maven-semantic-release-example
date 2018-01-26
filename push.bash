#!/bin/bash
# copied and modified from https://gist.github.com/ddgenome/f3a60fe4c2af0cbe758556d982fbeea9

if [[ $GITHUB_TOKEN ]]; then
    remote=https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG
fi
if [[ $GH_TOKEN ]]; then
    remote=https://$GH_TOKEN@github.com/$TRAVIS_REPO_SLUG
fi

echo "bash pushing"
if ! git push --quiet --follow-tags "$remote" "$TRAVIS_BRANCH" > /dev/null 2>&1; then
    err "failed to push git changes"
    return 1
fi
echo "done pushing"

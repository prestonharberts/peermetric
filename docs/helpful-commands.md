# Helpful git commands

## Pull remote branch to local machine:
git checkout -b dev origin/dev

## Delete most recent local commit (will delete your changes too!)
git reset --hard HEAD~1

## Create and switch to new local branch:
git checkout -b <branch-name>

## Push that new local branch branch to remote:
git push --set-upstream origin <branch-name>

## Delete local branch:
git branch -d <branch-name>

## Delete that local branch on remote too:
git push -d --set-upstream origin <branch-name>

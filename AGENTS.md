# Repository instructions

## Squash-merge workflow

- The user merges pull requests using **squash and merge**. The target branch contains a new squash commit rather than the original feature-branch commits.
- Fetch the remote and check the intended PR base before creating a new branch. Start independent work from the updated target branch, normally `origin/main`.
- Do not assume that a feature branch is up to date merely because its changes have merged. Branching from it can reintroduce already-merged commits and cause misleading PR diffs or conflicts.
- For dependent branches, after the parent PR is squash-merged, rebase only the remaining work onto the updated target branch, dropping the old parent commits. Use `git rebase --onto <updated-base> <old-parent-tip> <branch>` when appropriate.
- Before pushing, check the commits and diff against the intended base. When an authorized rebase rewrites a published branch, push with `--force-with-lease`.

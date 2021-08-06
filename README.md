# semantic-release

GitHub Action to run
[**semantic-release**](https://github.com/semantic-release/semantic-release/) with
the DHIS2 customizations and extensions in place.

In addition to the ready-made **semantic-release** plugins:

-   [commit-analyzer](https://github.com/semantic-release/commit-analyzer)
-   [release-notes-generator](https://github.com/semantic-release/release-notes-generator)
-   [changelog](https://github.com/semantic-release/changelog)
-   [npm](https://github.com/semantic-release/npm)
-   [git](https://github.com/semantic-release/git)
-   [github](https://github.com/semantic-release/github)

We have a few custom plugins that we use:

-   [defer-release](custom/semantic-release-defer-release.js)
-   [update-deps](custom/semantic-release-update-deps.js)
-   [apphub](custom/semantic-release-apphub.js)

# Usage

Create a workflow, or use an example from
[dhis2/workflows](https://github.com/dhis2/workflows) as a base.

To use in an existing workflow, add the action to a step after the build
process:

```
- uses: dhis2/action-semantic-release@master
  with:
      github-token: ${{ env.GH_TOKEN }}
```

> :information_source: It is possible to lock the action version by
> referencing a tag in the `uses` statement, e.g.:
> `dhis2/action-semantic-release@1.2.1`.

We use `GH_TOKEN` and not `GITHUB_TOKEN` to distinguish between the user
who pushed (`GITHUB_TOKEN`) and the PAT of our bot account (`GH_TOKEN`).

# Options

See the [`action.yml`](action.yml) file for an overview of the
configuration possibilities. In DHIS2 scenarios, the defaults should be
sane.

# git-att

Check if any of your git projects needs attention:

Runs through all your code projects and checks the following:

- Is the repo on the master branch?
- Is the current branch ahead of the remote tracking branch?
- Is the repo dirty (i.e. does it contain changes that have not yet been
  checked in)
- Is there any untracked files in the repo?

If the answer is yes to any of those questions, this module will find
and list the projects.

[![Build status](https://travis-ci.org/watson/git-att.svg?branch=master)](https://travis-ci.org/watson/git-att)

## Installation

Install git-att globally:

```
git install -g git-att
```

## Example usage

```
$ git-att ~/code
DIR                BRANCH      AHEAD DIRTY UNTRACKED
after-all-results  master      0     1     0
airserver          master      0     3     10
connect            master      95    1     0
hubot-heroku       patch-1     0     1     0
```

## Docs

```
git-att [options] [path]
```

The `path` defaults to the current direcotry if not specified. The
git-att program will look through that directory and all sub-directories
scanning for git projects.

Options:

- `--help` - show the help
- `--version` - show version
- `--simple` - make the output more simple for easy grepping

## License

MIT

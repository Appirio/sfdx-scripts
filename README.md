# sfdx-scripts
Define named scripts to run at various times in the lifecycle of your project.


## About
I found myself keeping `npm` in my sfdx projects just so that I could use the `npm run` command to manage lifecycle scripts. That seemed rather silly, so I created this (very) simple sfdx plugin to replace `npm run`.

## Installation & Usage
Install `sfdx-scripts` the same way you would any other sfdx plugin. The plugin provides two commands: `run` and `run:list`.

```sh-session
$ sfdx plugins:install @appirio/sfdx-scripts
```

## Listing Defined Scripts
To list what scripts are defined in the project use `run:list`.

```sh-session
$ sfdx run:list
=== Scripts
start
install
stop
publish
```

## Executing a Script
Use the `run` command to execute a script.

```sh-session
$ sfdx run standup
```

Errors will always be printed to the console, but if you want to see the complete output of all commands use the `--verbose` flag. The script will cease execution at the first error.

```sh-session
$ sfdx run standup --verbose
```

## Defining Scripts
Scripts are defined in the `plugins` section of `sfdx-project.json`. Each command is expected to be an `sfdx` command, so you can skip writing `sfdx` at the start of every line. Your commands can be a single line or a list.

```json
{
  ...
  "plugins" : {
    "scripts" : {
      "standup" : [
        "force:org:create -f config/project-scratch-def.json -s -a myProject",
        "force:source:push"
      ],
      "teardown" : "force:org:delete --noprompt -a myProject"
    }
  }
  ...
}
```

## Headings
For friendlier output while a script is running, you can define heading steps in your script. Any script step that starts with a hash (`#`) is a heading step. Everything after the hash will be written to the console as heading.

```json
{
  ...
  "plugins" : {
    "scripts" : {
      "standup" : [
        "# Create org",
        "force:org:create -f config/project-scratch-def.json -s -a myProject",
        "force:source:push"
      ]
    }
  }
  ...
}
```

```sh-session
$ sfdx run standup
=== Create Org
force:org:create -f config/project-scratch-def.json -s -a myProject... ✔︎
force:source:push... ✔︎
```

## Subscripts
Remember, `run` is a command just like any other for `sfdx`. You can use it call scripts from other scripts. I figure that is a pretty common thing, so you can also use `.` in place of `run` in your scripts.

```json
{
  ...
  "plugins" : {
    "scripts" : {
      "standup" : [
        "force:org:create -f config/project-scratch-def.json -s -a myProject",
        ". installDependencies",
        "force:source:push",
        ". addUsers",
        ". installDemoData"
      ],
      "installDependencies" : [...],
      "addUsers" : [...],
      "installDemoData" : [...]
    }
  }
  ...
}
```

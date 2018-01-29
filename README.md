# HDFS Browser

A simple HDFS File Browser that reads from a local HDFS instance.

## Features

Connect to a local HDFS instance and browse files & folders.
* A `HDFS Files` view is added to the Explorer. Any added folders are shown here
* Clicking the `Connect to HDFS Folder` button adds a folder to the `HDFS Files` view.

## Known Issues

* Currently, only the default `localhost:50070` instance is queryable. This supports testing against a default Cloudera or Hortonworks sandbox, but doesn't allow real connections

## Release Notes


### 0.1.0

Initial release of HDFS Browser. Support for viewing the folder structure and what files are available

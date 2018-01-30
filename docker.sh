# Pull cloudera image from docker
docker pull cloudera/quickstart:latest
# Start image, exposing localhost:8888 for Hue, localhost:8080 for the getting started guide, and 50070 for HDFS connectivity
docker run --hostname=quickstart.cloudera --privileged=true -t -i -v /Users/kcunnane/Documents/hadoop:/src --publish-all=true -p 8888:8888 -p 8080:80 -p 50070:50070  cloudera/quickstart /usr/bin/docker-quickstart
# recorder

A nodejs application to consume your ipcamera video feeds and save to disk.

## About


## Features

- Written in nodejs
- No installation necessary - just use docker-compose.
- Stupidly [easy to use](https://github.com/opnvr/recorder#usage)
- Works on Mac, Linux and (maybe) Windows
- Simple file retention mechanism, with plans for more sophisticated retentions.

## Installation

Currently its reccomended to use docker compose to run the application for easy install.  If there is demand for alternate installation types can work on those.

### Docker compose

docker-compose is available for OSX (macOS), Linux and Windows.

Create a docker-compose file similar to below.


```yaml
version: "3.8"
services:
  nvrrecorder:
    image: ghcr.io/opnvr/recorder:latest
    container_name: nvrrecorder
    environment:
      - TZ=Australia/Sydney
    volumes:
      - /path/to/config.yaml:/var/app/config.yaml:ro
      - /video:/video
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-file: "5"
        max-size: "10m"
```

## Configuration

The following sections exist in the config.yaml file

<br/>

### root level

| Name                       | Default value      | Description                                                                 |
| -------------------------- | ------------------ | --------------------------------------------------------------------------- |
| sources                    | `[]`               | List of camera sources to be recorded                                       |
| logging                    | `NULL`             | Logging configuration                                                       |
| output                     | `/video`           | Root folder that the recorded video will be stored                          |

<br/>

### sources

| Name                       | Default value      | Description                                                                 |
| -------------------------- | ------------------ | --------------------------------------------------------------------------- |
| sources.type               | None               | Type of video source, currently supported types are `RTSP`                  |

<br/>

### sources[RTSP]

| Name                       | Default value      | Description                                                                 |
| -------------------------- | ------------------ | --------------------------------------------------------------------------- |
| sources.type               | `RTSP`             | Type of video source `RTSP`                                                 |
| sources.id                 | None               | id to be used as folder name to store this source                           |
| sources.ipAddress          | None               | ip address of rtsp camera                                                   |
| sources.authentication     | None               | Optional authentication configuration                                       |

<br/>

### sources[RTSP].authentication

| Name                          | Default value      | Description                                                                 |
| ----------------------------- | ------------------ | --------------------------------------------------------------------------- |
| sources.authentication.enable | `true`             | Enable authentication for this source                                       |
| sources.authentication.user   | None               | Username                                                                    |
| sources.authentication.pass   | None               | Password                                                                    |


| FULL_NAME                  | Alexey Potapov     | Your full name                                                              |
| OPEN_SOURCE_LICENSE        | MIT license        | Full OSS license name                                                       |
| modern_header              | y                  | Use HTML to prettify your header                                            |
| table_in_about             | n                  | Use table to wrap around About section                                      |
| include_logo               | y                  | Include Logo section. Could only be used when `modern_header == y`          |
| include_badges             | y                  | Include section for badges                                                  |
| include_toc                | y                  | Include Table of Contents                                                   |
| include_screenshots        | y                  | Include Screenshots section                                                 |
| include_project_assistance | y                  | Include Project assistance section                                          |
| include_authors            | y                  | Include Authors & contributors section                                      |
| include_security           | y                  | Include Security section and SECURITY.md file                               |
| include_acknowledgements   | y                  | Include Acknowledgements section                                            |
| include_code_of_conduct    | y                  | Include CODE_OF_CONDUCT.md file                                             |
| include_workflows          | y                  | Include .github/workflows directory                                         |
| use_codeql                 | y                  | Use [CodeQL](https://securitylab.github.com/tools/codeql/)                  |
| use_conventional_commits   | y                  | Add [Conventional Commits](https://www.conventionalcommits.org) notice      |
| use_github_discussions     | n                  | Use [GitHub Discussions](https://docs.github.com/en/discussions/quickstart) |
### Example config.yaml showing defaults

```yaml
sources:
  - type: RTSP
    id: Cam02
    ipAddress: 192.168.1.202
    authentication:
      enable: true
      user: myuser
      pass: mypassword

logging:
  level: warn
  ffmpeg: warning

output:
  rootFolder: '/video'
  retention:
    type: simple
    duration: P5D
```

## Contributing

#### Bug Reports & Feature Requests

Please use the [issue tracker](https://github.com/opnvr/recorder/issues) to report any bugs or file feature requests.

#### Developing

PRs are welcome. To begin developing, do this:

```bash
$ git clone git@github.com:opnvr/recorder.git
$ cd recorder/
$ node index.js
```

## License
Copyright (c) 2021 Tim Bailey  
Licensed under the MIT license.

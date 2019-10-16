Highsoft Websearch
==================

The search system consists of a client component and an generator component. A
server needs to provide access to the generated keyword files only. Therefor
neither a database nor a server script is needed, which makes the search system
compatible to any cloud storage with web browser access and text file support.



Usage
=====

The following command creates a set of keyword files with weights, URLs, and
titles of incpected URLs as tab separated values. If keyword files
already exist, it will add only new findings.

```sh
highsoft-websearch --depth 3 --out ./local-keyword-directory/ https://my.website.example/
```



Options
=======

There are several options to inspect multiple domains, subdomains, and offline
files.

| Option                  | Description                                              |
|-------------------------|----------------------------------------------------------|
| `--allowForeignDomains` | Allow foreign domains in link levels.                    |
| `--delay [number]`      | Set delay in milliseconds between downloads.             |
| `--depth [number]`      | Set number of link levels to follow.                     |
| `--help`, `-h`          | Prints this help text.                                   |
| `--out [directory]`     | Set output directory for keyword files.                  |
| `--timeout [number]`    | Set timeout in milliseconds to wait for server response. |
| `--verbose`, `-v`       | Prints detailed actions for each URL and keyword file.   |
| `--version`,            | Prints the version number.                               |

Options can be also set in a JSON file called `highsoft-websearch.json` in the
current working directory.

```json
{
    "allowForeignDomains": false,
    "delay": 1000,
    "depth": 1,
    "timeout": 60000,
    "verbose": false
}
```